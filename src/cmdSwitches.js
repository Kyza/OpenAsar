const { app } = require('electron');

const presets = {
  'perf': `--enable-gpu-rasterization --enable-zero-copy --ignore-gpu-blocklist --enable-hardware-overlays=single-fullscreen,single-on-top,underlay --enable-features=EnableDrDc,CanvasOopRasterization,BackForwardCache:TimeToLiveInBackForwardCacheInSeconds/300/should_ignore_blocklists/true/enable_same_site/true,ThrottleDisplayNoneAndVisibilityHiddenCrossOriginIframes,UseSkiaRenderer,WebAssemblyLazyCompilation --disable-features=Vulkan --force_high_performance_gpu --enable-quic`, // Performance
  'disablemediakeys': '--disable-features=HardwareMediaKeyHandling', // Disables media keys (common want?)
  'battery': '--enable-features=TurnOffStreamingMediaCachingOnBattery --force_low_power_gpu' // Known to have better battery life for Chromium?
};

const combinePresets = (keys) => {
  let total = {};
  for (const pre of keys) {
    for (const cmd of presets[pre].split(' ')) {
      const [ key, value ] = cmd.split('=');

      if (total[key]) {
        if (value) {
          total[key] += ',' + value; // Concat value with , for flags like --enable-features
        } // Else no value, ignore as it already exists
      } else {
        total[key] = value;
      }
    }
  }
  
  return Object.keys(total).reduce((acc, x) => acc += (x + (total[x] ? ('=' + total[x]) : '') + ' '), '');
};


module.exports = () => {
  const preset = oaConfig.cmdPreset || 'perf'; // Default to most (should default to none?) // 'perf,perf-ex,perf-ex2,battery,memory-ex2'
  let cmdSwitches = presets[preset] || ''; // Default to blank (no switches)

  log('CmdSwitches', 'Preset:', preset);

  if (preset.includes(',')) cmdSwitches = combinePresets(preset.split(','));

  if (cmdSwitches) {
    cmdSwitches = `--flag-switches-begin ` + cmdSwitches + ` --flag-switches-end`; // Probably unneeded for Chromium / Electron manual flags but add anyway

    log('CmdSwitches', 'Switches:', cmdSwitches);

    module.exports.cmd = cmdSwitches;
    module.exports.preset = preset;

    const switches = cmdSwitches.split(' ');

    for (const cmd of switches) {
      let [ key, value ] = cmd.split('=');
      key = key.replace('--', ''); // Replace --key with key (?)

      app.commandLine.appendSwitch(key, value);
      log('CmdSwitches', 'Appended switch', key, value);
    }
  }
}
