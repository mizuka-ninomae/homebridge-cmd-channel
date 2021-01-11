const exec = require('child_process').exec;
const cmd  = "curl GET 'http://192.168.1.101/messages' -H 'X-Requested-With: local'"

let json = exec(cmd,  function(error, stdout, stderr) {
  let jsonData = JSON.parse(stdout);
  console.log(jsonData);
  console.log('DataLength' + jsonData.data.length);

  const t1 = Math.round((jsonData.data[0] + jsonData.data[1]) / 24);
  console.log('T1: ' + t1);
  let j = 0;
  let array_1 = new Array();
  for (let i = 0; i < jsonData.data.length - 1; i = i + 2) {
    let on  = Math.round(jsonData.data[i] / t1)
    let off = Math.round(jsonData.data[i + 1] / t1);
    if      (on == 1 && off == 1) {
      console.log(i + '[1, 1]');
      array_1[j] = 0;
      j++;
    }
    else if (on == 1 && off == 3) {
      console.log(i + '[1, 3]');
      array_1[j] = 1;
      j++;
    }
    else if (on == 16 && off == 8) {
      console.log(i + '[Leader]');
    }
    else if (on == 16 && off == 4) {
      console.log(i + '[Repeat]');
    }
    else{
      console.log(i + '[Other]');
    }
  }

  let array_2 = new Array();
  let l = 0;
  for (let k = 0; k < array_1.length; k = k + 4) {
    let binary = array_1[k].toString() + array_1[k + 1].toString() + array_1[k + 2].toString() + array_1[k + 3].toString();
    let hex    = parseInt(binary, 2).toString(16)
    array_2[l] = hex;
    l++;
  }

  console.log(array_2);
  for (let m = 0; m < array_2.length; m = m + 2) {
    process.stdout.write(array_2[m] + array_2[m + 1]+ ' ');
  }
})
