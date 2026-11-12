const os = require("os"), fs = require("fs");
const orig = os.userInfo, origHome = os.homedir;
let safeHome;
try {
  const h = origHome.call(os);
  fs.accessSync(h + "/Library/Preferences", fs.constants.W_OK);
  safeHome = h;
} catch {
  safeHome = os.tmpdir();
}
os.homedir = () => safeHome;
os.userInfo = function (o) {
  try { return orig.call(os, o); }
  catch { return { username: "zenx", uid: 501, gid: 20, shell: "/bin/zsh", homedir: safeHome }; }
};
