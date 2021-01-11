let Service, Characteristic;
const exec = require('child_process').exec;


module.exports = function(homebridge){
  Service        = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;
  homebridge.registerAccessory('homebridge-cmd-channel', 'cmd-channel', ChannelAccessory);
}

function ChannelAccessory(log, config) {
  this.log                   = log;
  this.name                  = config["name"];
  this.ip                    = config["ip"];
  this.powe_signal           = config["powe_signal"]
  this.inputs                = config["inputs"];
  this.state = {
    power: true,
    ambilight: true,
    source: 0,
    volume: 0,
  };

  this.infoService       = new Service.AccessoryInformation();
  this.televisionService = new Service.Television(this.name);
  this.inputService_0    = new Service.InputSource(this.inputs[0].name, 0);
  this.inputService_1    = new Service.InputSource(this.inputs[1].name, 1);
  this.inputService_2    = new Service.InputSource(this.inputs[2].name, 2);
  this.inputService_3    = new Service.InputSource(this.inputs[3].name, 3);
  this.inputService_4    = new Service.InputSource(this.inputs[4].name, 4);

  this.infoService
  .setCharacteristic(Characteristic.Manufacturer, "CMD-Channel Manufacturer")
  .setCharacteristic(Characteristic.Model, "CMD-Channel Manufacturer")
  .setCharacteristic(Characteristic.SerialNumber, "CMD-Channel  Serial Number");

  this.televisionService
  .setCharacteristic(Characteristic.ConfiguredName, this.name)
  .setCharacteristic(Characteristic.SleepDiscoveryMode, Characteristic.SleepDiscoveryMode.ALWAYS_DISCOVERABLE)
  .setCharacteristic(Characteristic.ActiveIdentifier, 1);

  this.inputService_0
  .setCharacteristic(Characteristic.Identifier, 0)
  .setCharacteristic(Characteristic.ConfiguredName, this.inputs[0].name)
  .setCharacteristic(Characteristic.IsConfigured, Characteristic.IsConfigured.CONFIGURED)
  .setCharacteristic(Characteristic.InputSourceType, Characteristic.InputSourceType.DP);
  this.televisionService.addLinkedService(this.inputService_0);

  this.inputService_1
  .setCharacteristic(Characteristic.Identifier, 1)
  .setCharacteristic(Characteristic.ConfiguredName, this.inputs[1].name)
  .setCharacteristic(Characteristic.IsConfigured, Characteristic.IsConfigured.CONFIGURED)
  .setCharacteristic(Characteristic.InputSourceType, Characteristic.InputSourceType.HDMI);
  this.televisionService.addLinkedService(this.inputService_1);

  this.inputService_2
  .setCharacteristic(Characteristic.Identifier, 2)
  .setCharacteristic(Characteristic.ConfiguredName, this.inputs[2].name)
  .setCharacteristic(Characteristic.IsConfigured, Characteristic.IsConfigured.CONFIGURED)
  .setCharacteristic(Characteristic.InputSourceType, Characteristic.InputSourceType.HDMI);
  this.televisionService.addLinkedService(this.inputService_2);

  this.inputService_3
  .setCharacteristic(Characteristic.Identifier, 3)
  .setCharacteristic(Characteristic.ConfiguredName, this.inputs[3].name)
  .setCharacteristic(Characteristic.IsConfigured, Characteristic.IsConfigured.CONFIGURED)
  .setCharacteristic(Characteristic.InputSourceType, Characteristic.InputSourceType.HDMI);
  this.televisionService.addLinkedService(this.inputService_3);

  this.inputService_4
  .setCharacteristic(Characteristic.Identifier, 4)
  .setCharacteristic(Characteristic.ConfiguredName, this.inputs[4].name)
  .setCharacteristic(Characteristic.IsConfigured, Characteristic.IsConfigured.CONFIGURED)
  .setCharacteristic(Characteristic.InputSourceType, Characteristic.InputSourceType.ANALOG);
  this.televisionService.addLinkedService(this.inputService_4);

  this.televisionService
  .getCharacteristic(Characteristic.Active)
  .on('set', this.setPowerState.bind(this));

  this.televisionService
  .getCharacteristic(Characteristic.ActiveIdentifier)
  .on('set', this.setCannel.bind(this));
}

//------------------------------------------------------------------------------
ChannelAccessory.prototype.getServices = function() {
  return [this.infoService, this.televisionService, this.inputService_0, this.inputService_1, this.inputService_2, this.inputService_3, this.inputService_4];
}

//------------------------------------------------------------------------------
ChannelAccessory.prototype.setPowerState = function(value, callback) {
  this.log('Power Button: ' + value);
  this.cmdRequest(this.powe_signal, callback);
}

ChannelAccessory.prototype.setCannel = function(channel, callback) {
  this.log('Channel: ' + this.inputs[channel].name);
  this.cmdRequest(this.inputs[channel].signal, callback);
}

ChannelAccessory.prototype.cmdRequest = function(input, callback) {
  let cmd;
  if (this.ip == null) {
    cmd = input;
  }
  else {
    const t1  = 562;
    const t3  = t1 * 3;
    const t4  = t1 * 4;
    const t8  = t1 * 8;
    const t16 = t1 * 16;

    hex = input.replace(/\r?\n/g,"").split(' ')
    let binary = new String();
    let data_1 = new String();
    for (let i = 0; i < hex.length; i++) {
      binary = ('00000000' + String(parseInt(hex[i], 16).toString(2))).slice(-8);
      data_1 = data_1 + binary;
    }
    let array_1 = new Array();
    array_1 = data_1.split('');

    let k = 0
    let l = 0
    let array_2 = new Array();
    for (let j = 0; j < array_1.length; j++) {
      if (l == 32) {
        array_2[k] = t1
        array_2[k + 1] = t8
        k = k + 2;
      }
      if (j == 0 || l == 32) {
        array_2[k] = t16
        array_2[k + 1] = t8
        l = 0;
        k = k + 2;
      }
      if      (array_1[j] == 0) {
        array_2[k] = t1
        array_2[k + 1] = t1
        k = k + 2;
      }
      else if (array_1[j] == 1) {
        array_2[k] = t1
        array_2[k + 1] = t3
        k = k + 2;
      }
      l++;
    }
    array_2.push(t1);
    array_2.push(t8);

    const cmd_1 = "curl -X POST 'http://" + this.ip + "/messages' -H 'X-Requested-With: curl' -d '{\"format\":\"us\",\"freq\":38,\"data\":[";
    const cmd_2 = "]}'";
    cmd = cmd_1 + array_2.join(',') + cmd_2;
  }
  this.log(cmd);
  exec(cmd, function(error, stdout, stderr) {
    callback(error, stdout, stderr)
  })
}
