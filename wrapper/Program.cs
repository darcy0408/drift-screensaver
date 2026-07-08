// DRIFT screensaver host.
// Windows screensaver protocol: /s = run, /c = configure, /p <hwnd> = preview.
// Written for C# 5 so it compiles with the csc.exe bundled in Windows (.NET Framework 4.8).

using System;
using System.Drawing;
using System.IO;
using System.Runtime.InteropServices;
using System.Windows.Forms;
using Microsoft.Web.WebView2.Core;
using Microsoft.Web.WebView2.WinForms;

namespace DriftSaver
{
    static class Program
    {
        [DllImport("user32.dll")] static extern bool SetProcessDPIAware();
        [DllImport("user32.dll")] static extern IntPtr SetParent(IntPtr hWndChild, IntPtr hWndNewParent);
        [DllImport("user32.dll")] static extern int GetWindowLong(IntPtr hWnd, int nIndex);
        [DllImport("user32.dll")] static extern int SetWindowLong(IntPtr hWnd, int nIndex, int dwNewLong);
        [DllImport("user32.dll")] static extern bool GetClientRect(IntPtr hWnd, out RECT rect);
        [DllImport("user32.dll")] static extern bool IsWindow(IntPtr hWnd);

        [StructLayout(LayoutKind.Sequential)]
        public struct RECT { public int Left, Top, Right, Bottom; }

        const int GWL_STYLE = -16;
        const int WS_CHILD = 0x40000000;

        [STAThread]
        static void Main(string[] args)
        {
            try { SetProcessDPIAware(); } catch { }
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);

            string mode = "c";
            IntPtr previewHwnd = IntPtr.Zero;
            if (args.Length > 0)
            {
                string a = args[0].Trim().ToLowerInvariant();
                if (a.StartsWith("/s")) mode = "s";
                else if (a.StartsWith("/p"))
                {
                    mode = "p";
                    string handleStr = null;
                    if (a.Contains(":")) handleStr = a.Split(':')[1];
                    else if (args.Length > 1) handleStr = args[1];
                    long h;
                    if (handleStr != null && long.TryParse(handleStr, out h)) previewHwnd = new IntPtr(h);
                }
            }

            if (mode == "s") RunSaver();
            else if (mode == "p") RunPreview(previewHwnd);
            else Application.Run(new SettingsForm());
        }

        static void RunSaver()
        {
            Screen[] screens = Screen.AllScreens;
            SaverForm[] forms = new SaverForm[screens.Length];
            for (int i = 0; i < screens.Length; i++)
            {
                forms[i] = new SaverForm(screens[i].Bounds);
                forms[i].FormClosed += delegate { Application.Exit(); };
            }
            for (int i = 0; i < forms.Length; i++) forms[i].Show();
            Application.Run(new ApplicationContext());
        }

        static void RunPreview(IntPtr parent)
        {
            if (parent == IntPtr.Zero) return;
            RECT rect;
            GetClientRect(parent, out rect);

            PreviewForm form = new PreviewForm();
            form.CreateControl();
            IntPtr handle = form.Handle; // force handle creation before reparenting
            SetWindowLong(handle, GWL_STYLE, GetWindowLong(handle, GWL_STYLE) | WS_CHILD);
            SetParent(handle, parent);
            form.Location = new Point(0, 0);
            form.Size = new Size(rect.Right - rect.Left, rect.Bottom - rect.Top);

            // The Screen Saver dialog destroys the parent without telling us; poll for it.
            Timer watchdog = new Timer();
            watchdog.Interval = 1000;
            watchdog.Tick += delegate { if (!IsWindow(parent)) Application.Exit(); };
            watchdog.Start();

            Application.Run(form);
        }
    }

    static class Settings
    {
        public static string Mode = "tour";
        public static int Dwell = 55;
        public static bool Labels = false;

        static string FilePath()
        {
            return Path.Combine(
                Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData),
                "DriftSaver", "settings.txt");
        }

        public static void Load()
        {
            try
            {
                if (!File.Exists(FilePath())) return;
                foreach (string line in File.ReadAllLines(FilePath()))
                {
                    string[] parts = line.Split(new char[] { '=' }, 2);
                    if (parts.Length != 2) continue;
                    string key = parts[0].Trim();
                    string val = parts[1].Trim();
                    if (key == "mode") Mode = val;
                    else if (key == "dwell") int.TryParse(val, out Dwell);
                    else if (key == "labels") Labels = val == "1";
                }
            }
            catch { }
        }

        public static void Save()
        {
            try
            {
                Directory.CreateDirectory(Path.GetDirectoryName(FilePath()));
                File.WriteAllLines(FilePath(), new string[] {
                    "mode=" + Mode,
                    "dwell=" + Dwell,
                    "labels=" + (Labels ? "1" : "0"),
                });
            }
            catch { }
        }

        public static string QueryString()
        {
            return "mode=" + Mode + "&dwell=" + Dwell + "&labels=" + (Labels ? "1" : "0");
        }
    }

    class SaverForm : Form
    {
        static CoreWebView2Environment sharedEnv;
        static readonly object logLock = new object();
        WebView2 web;

        static string BaseDir()
        {
            return Path.GetDirectoryName(Application.ExecutablePath);
        }

        // Diagnostics only run when a debug.flag file sits next to the .scr.
        static bool DebugMode()
        {
            return File.Exists(Path.Combine(BaseDir(), "debug.flag"));
        }

        static void Log(string msg)
        {
            if (!DebugMode()) return;
            try
            {
                lock (logLock)
                {
                    File.AppendAllText(
                        Path.Combine(BaseDir(), "drift-log.txt"),
                        DateTime.Now.ToString("HH:mm:ss.fff") + "  " + msg + "\r\n");
                }
            }
            catch { }
        }

        async System.Threading.Tasks.Task AttachDebugger()
        {
            Log("=== saver started, attaching console listeners ===");
            web.CoreWebView2.NavigationCompleted += delegate(object s, CoreWebView2NavigationCompletedEventArgs e)
            {
                Log("NavigationCompleted success=" + e.IsSuccess + " webErrorStatus=" + e.WebErrorStatus);
            };
            web.CoreWebView2.ProcessFailed += delegate(object s, CoreWebView2ProcessFailedEventArgs e)
            {
                Log("ProcessFailed kind=" + e.ProcessFailedKind);
            };
            await web.CoreWebView2.CallDevToolsProtocolMethodAsync("Runtime.enable", "{}");
            await web.CoreWebView2.CallDevToolsProtocolMethodAsync("Log.enable", "{}");
            web.CoreWebView2.GetDevToolsProtocolEventReceiver("Runtime.consoleAPICalled").DevToolsProtocolEventReceived +=
                delegate(object s, CoreWebView2DevToolsProtocolEventReceivedEventArgs e) { Log("console: " + e.ParameterObjectAsJson); };
            web.CoreWebView2.GetDevToolsProtocolEventReceiver("Runtime.exceptionThrown").DevToolsProtocolEventReceived +=
                delegate(object s, CoreWebView2DevToolsProtocolEventReceivedEventArgs e) { Log("EXCEPTION: " + e.ParameterObjectAsJson); };
            web.CoreWebView2.GetDevToolsProtocolEventReceiver("Log.entryAdded").DevToolsProtocolEventReceived +=
                delegate(object s, CoreWebView2DevToolsProtocolEventReceivedEventArgs e) { Log("log: " + e.ParameterObjectAsJson); };
        }

        public SaverForm(Rectangle bounds)
        {
            FormBorderStyle = FormBorderStyle.None;
            StartPosition = FormStartPosition.Manual;
            Bounds = bounds;
            TopMost = true;
            ShowInTaskbar = false;
            BackColor = Color.Black;
            Load += OnLoadAsync;
        }

        async void OnLoadAsync(object sender, EventArgs e)
        {
            try
            {
                web = new WebView2();
                web.Dock = DockStyle.Fill;
                web.DefaultBackgroundColor = Color.Black;
                Controls.Add(web);

                if (sharedEnv == null)
                {
                    string dataDir = Path.Combine(
                        Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
                        "DriftSaver", "WebView2");
                    sharedEnv = await CoreWebView2Environment.CreateAsync(null, dataDir, null);
                }
                await web.EnsureCoreWebView2Async(sharedEnv);

                string webDir = Path.Combine(BaseDir(), "web");
                web.CoreWebView2.SetVirtualHostNameToFolderMapping(
                    "drift.app", webDir, CoreWebView2HostResourceAccessKind.Allow);

                CoreWebView2Settings s = web.CoreWebView2.Settings;
                s.AreDefaultContextMenusEnabled = false;
                s.AreDevToolsEnabled = false;
                s.IsStatusBarEnabled = false;
                s.IsZoomControlEnabled = false;

                if (DebugMode()) await AttachDebugger();

                web.CoreWebView2.WebMessageReceived += OnWebMessage;
                web.KeyDown += OnWebKeyDown; // accelerator keys are forwarded as WinForms KeyDown

                Settings.Load();
                web.CoreWebView2.Navigate("https://drift.app/index.html?" + Settings.QueryString());
            }
            catch (Exception ex)
            {
                MessageBox.Show(
                    "DRIFT could not start its browser engine. It needs the Microsoft WebView2 Runtime "
                    + "(preinstalled on Windows 11; otherwise search 'Evergreen WebView2 Runtime').\n\nDetails: " + ex.Message,
                    "DRIFT Screensaver", MessageBoxButtons.OK, MessageBoxIcon.Warning);
                Application.Exit();
            }
        }

        void OnWebMessage(object sender, CoreWebView2WebMessageReceivedEventArgs e)
        {
            string msg = null;
            try { msg = e.TryGetWebMessageAsString(); } catch { }
            if (msg == "exit") Application.Exit();
        }

        void OnWebKeyDown(object sender, KeyEventArgs e)
        {
            if (e.KeyCode == Keys.Escape) Application.Exit();
        }
    }

    class SettingsForm : Form
    {
        ComboBox modeBox;
        NumericUpDown dwellBox;
        CheckBox labelsBox;

        public SettingsForm()
        {
            Settings.Load();
            Text = "DRIFT Screensaver Settings";
            FormBorderStyle = FormBorderStyle.FixedDialog;
            MaximizeBox = false;
            MinimizeBox = false;
            ClientSize = new Size(350, 185);
            StartPosition = FormStartPosition.CenterScreen;

            Label modeLabel = new Label();
            modeLabel.Text = "Tour mode:";
            modeLabel.Location = new Point(20, 22);
            modeLabel.AutoSize = true;

            modeBox = new ComboBox();
            modeBox.DropDownStyle = ComboBoxStyle.DropDownList;
            modeBox.Items.AddRange(new object[] { "World Tour", "Mystery Files", "Deep Field (random)", "Golden Hour" });
            modeBox.Location = new Point(150, 18);
            modeBox.Width = 170;
            modeBox.SelectedIndex = Settings.Mode == "mystery" ? 1 : Settings.Mode == "random" ? 2 : Settings.Mode == "golden" ? 3 : 0;

            Label dwellLabel = new Label();
            dwellLabel.Text = "Seconds per place:";
            dwellLabel.Location = new Point(20, 60);
            dwellLabel.AutoSize = true;

            dwellBox = new NumericUpDown();
            dwellBox.Minimum = 15;
            dwellBox.Maximum = 600;
            dwellBox.Value = Math.Min(600, Math.Max(15, Settings.Dwell));
            dwellBox.Location = new Point(150, 56);
            dwellBox.Width = 80;

            labelsBox = new CheckBox();
            labelsBox.Text = "Show place-name labels";
            labelsBox.Location = new Point(23, 94);
            labelsBox.AutoSize = true;
            labelsBox.Checked = Settings.Labels;

            Button ok = new Button();
            ok.Text = "Save";
            ok.Location = new Point(150, 135);
            ok.Click += OnSave;

            Button cancel = new Button();
            cancel.Text = "Cancel";
            cancel.Location = new Point(240, 135);
            cancel.Click += delegate { Close(); };

            Controls.AddRange(new Control[] { modeLabel, modeBox, dwellLabel, dwellBox, labelsBox, ok, cancel });
            AcceptButton = ok;
            CancelButton = cancel;
        }

        void OnSave(object sender, EventArgs e)
        {
            Settings.Mode = modeBox.SelectedIndex == 1 ? "mystery"
                : modeBox.SelectedIndex == 2 ? "random"
                : modeBox.SelectedIndex == 3 ? "golden"
                : "tour";
            Settings.Dwell = (int)dwellBox.Value;
            Settings.Labels = labelsBox.Checked;
            Settings.Save();
            Close();
        }
    }

    // Tiny monitor thumbnail in the Screen Saver control panel — a full WebView2
    // is overkill there, so it's just a badge.
    class PreviewForm : Form
    {
        public PreviewForm()
        {
            FormBorderStyle = FormBorderStyle.None;
            BackColor = Color.Black;
            Label label = new Label();
            label.Text = "DRIFT";
            label.ForeColor = Color.FromArgb(232, 195, 90);
            label.Font = new Font("Consolas", 12, FontStyle.Bold);
            label.Dock = DockStyle.Fill;
            label.TextAlign = ContentAlignment.MiddleCenter;
            Controls.Add(label);
        }
    }
}
