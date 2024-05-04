//==========================================================================
// table CRC 16
const CRC_Table = [
  0x0000, 0xc0c1, 0xc181, 0x0140, 0xc301, 0x03c0, 0x0280, 0xc241, 0xc601,
  0x06c0, 0x0780, 0xc741, 0x0500, 0xc5c1, 0xc481, 0x0440, 0xcc01, 0x0cc0,
  0x0d80, 0xcd41, 0x0f00, 0xcfc1, 0xce81, 0x0e40, 0x0a00, 0xcac1, 0xcb81,
  0x0b40, 0xc901, 0x09c0, 0x0880, 0xc841, 0xd801, 0x18c0, 0x1980, 0xd941,
  0x1b00, 0xdbc1, 0xda81, 0x1a40, 0x1e00, 0xdec1, 0xdf81, 0x1f40, 0xdd01,
  0x1dc0, 0x1c80, 0xdc41, 0x1400, 0xd4c1, 0xd581, 0x1540, 0xd701, 0x17c0,
  0x1680, 0xd641, 0xd201, 0x12c0, 0x1380, 0xd341, 0x1100, 0xd1c1, 0xd081,
  0x1040, 0xf001, 0x30c0, 0x3180, 0xf141, 0x3300, 0xf3c1, 0xf281, 0x3240,
  0x3600, 0xf6c1, 0xf781, 0x3740, 0xf501, 0x35c0, 0x3480, 0xf441, 0x3c00,
  0xfcc1, 0xfd81, 0x3d40, 0xff01, 0x3fc0, 0x3e80, 0xfe41, 0xfa01, 0x3ac0,
  0x3b80, 0xfb41, 0x3900, 0xf9c1, 0xf881, 0x3840, 0x2800, 0xe8c1, 0xe981,
  0x2940, 0xeb01, 0x2bc0, 0x2a80, 0xea41, 0xee01, 0x2ec0, 0x2f80, 0xef41,
  0x2d00, 0xedc1, 0xec81, 0x2c40, 0xe401, 0x24c0, 0x2580, 0xe541, 0x2700,
  0xe7c1, 0xe681, 0x2640, 0x2200, 0xe2c1, 0xe381, 0x2340, 0xe101, 0x21c0,
  0x2080, 0xe041, 0xa001, 0x60c0, 0x6180, 0xa141, 0x6300, 0xa3c1, 0xa281,
  0x6240, 0x6600, 0xa6c1, 0xa781, 0x6740, 0xa501, 0x65c0, 0x6480, 0xa441,
  0x6c00, 0xacc1, 0xad81, 0x6d40, 0xaf01, 0x6fc0, 0x6e80, 0xae41, 0xaa01,
  0x6ac0, 0x6b80, 0xab41, 0x6900, 0xa9c1, 0xa881, 0x6840, 0x7800, 0xb8c1,
  0xb981, 0x7940, 0xbb01, 0x7bc0, 0x7a80, 0xba41, 0xbe01, 0x7ec0, 0x7f80,
  0xbf41, 0x7d00, 0xbdc1, 0xbc81, 0x7c40, 0xb401, 0x74c0, 0x7580, 0xb541,
  0x7700, 0xb7c1, 0xb681, 0x7640, 0x7200, 0xb2c1, 0xb381, 0x7340, 0xb101,
  0x71c0, 0x7080, 0xb041, 0x5000, 0x90c1, 0x9181, 0x5140, 0x9301, 0x53c0,
  0x5280, 0x9241, 0x9601, 0x56c0, 0x5780, 0x9741, 0x5500, 0x95c1, 0x9481,
  0x5440, 0x9c01, 0x5cc0, 0x5d80, 0x9d41, 0x5f00, 0x9fc1, 0x9e81, 0x5e40,
  0x5a00, 0x9ac1, 0x9b81, 0x5b40, 0x9901, 0x59c0, 0x5880, 0x9841, 0x8801,
  0x48c0, 0x4980, 0x8941, 0x4b00, 0x8bc1, 0x8a81, 0x4a40, 0x4e00, 0x8ec1,
  0x8f81, 0x4f40, 0x8d01, 0x4dc0, 0x4c80, 0x8c41, 0x4400, 0x84c1, 0x8581,
  0x4540, 0x8701, 0x47c0, 0x4680, 0x8641, 0x8201, 0x42c0, 0x4380, 0x8341,
  0x4100, 0x81c1, 0x8081, 0x4040,
]

//==========================================================================
// Calculation of standard CRC-16 (ARC)
// ------------------------------------
function CRC16(data, size) {
  let crc = 0xffff
  let i = 0
  let len = size
  while (len--) {
    crc = (crc >> 8) ^ CRC_Table[(crc & 0xff) ^ (data[i++] & 0xff)]
  }
  return crc & 0xffff
}
//=============================================================
var timeOutTxPrt = 0
var timeOutFirmware = 0
let countRepit = 0
let flagLoadConfig = false
//----------------------------------------
function sbusPktSend(dev) {
  //console.log('dev: ', dev)
  let len = 0
  let l_par = 0
  var TxBuf = new Uint8Array(64)
  TxBuf[len++] = 0xca
  TxBuf[len++] = 0xfe
  TxBuf[len++] = dev.id_dev
  TxBuf[len++] = dev.id_dev >> 8
  TxBuf[len++] = 0 // TxBuf[4]
  TxBuf[len++] = dev.cmd

  switch (dev.cmd) {
    case 1:
      TxBuf[4] = 1
      break
    case 2:
      TxBuf[4] = 2
      TxBuf[len++] = dev.n_unit
      break
    case 3:
      TxBuf[4] = 3
      TxBuf[len++] = dev.id_unit
      TxBuf[len++] = dev.n_par
      break
    case 4:
      TxBuf[4] = 4
      TxBuf[len++] = dev.id_unit
      TxBuf[len++] = dev.n_par
      TxBuf[len++] = dev.l_par
      break
    case 5:
      TxBuf[len++] = dev.id_unit
      TxBuf[len++] = dev.n_par
      TxBuf[len++] = dev.l_par
      TxBuf[4] = dev.l_par + 4
      //console.log('l_par:', dev.l_par, dev.data)
      for (let i = 0; i < dev.l_par; i++) {
        //console.log('tx i:', i, dev.data[i])
        TxBuf[len++] = dev.data[i]
      }
      break
  }

  let crc = CRC16(TxBuf, len)
  TxBuf[len++] = crc
  TxBuf[len++] = crc >> 8
  TxBuf[len] = 0
  //console.log('TxBuf cmd5:', len, TxBuf)
  RxTail = 0
  pktTxCount++
  countRepit = 2
  if (flagCheckSel == 2) {
    client.send(TxBuf, 0, len, currDevice.port, currDevice.ip, (error) => {
      if (error) {
        console.log(error)
        closeConnect()
        clearInterval(timeOutTxPrt)
      }
    })
  } else if (flagCheckSel == 1) {
    var buf = new Uint8Array(len)
    for (let i = 0; i < len; i++) buf[i] = TxBuf[i]
    //if (dev.cmd == 5) console.log('buf:', buf)
    comPort.write(buf, function (err) {
      if (err) {
        console.log('Error COM sending message : ' + err)
        closeConnect()
        clearInterval(timeOutTxPrt)
      }
    })
  }
}
//==================================================
function LoadConfFromDevice() {
  currDevice.ser = numSerNum = document.getElementById('serNum').value
  currDevice = {
    ser: +numSerNum,
    ip: numIpAddr,
    port: +numIpPort,
    check: +flagCheckSel,
    com: numComPort,
    boud: numBoudRate,
    uNum: 0,
    unit: [],
  }
  $('#loadInfo1').prop('innerHTML', 'Loading configuration from device: ')
  if (flagCheckSel == 1) {
    $('#loadInfo2').prop(
      'innerHTML',
      'S/N: ' +
        currDevice.ser +
        ', ' +
        currDevice.com +
        ', Boud rate: ' +
        currDevice.boud
    )
  } else if (flagCheckSel == 2) {
    $('#loadInfo2').prop(
      'innerHTML',
      'S/N: ' +
        currDevice.ser +
        ', IP: ' +
        currDevice.ip +
        ', Port: ' +
        currDevice.port
    )
  }
  //console.log('currDevice:', currDevice)
  closeConnect()
  setTimeout(() => {
    clientConnect(currDevice)
    setTimeout(() => {
      if (flagConnect) {
        txDev = {
          id_dev: currDevice.ser,
          cmd: 1,
        }
        flagLoadConfig = true
        sbusPktSend(txDev)
      } else {
        console.log('No connection!')
      }
    }, 1000)
  }, 500)
}
//============================================= Load configuration from device
$('a#addDevice').click(function () {
  //console.log('addConfDevice')
  root_2P = []
  openNode = []
  var tree = $('div#treeDevice').jstree(true)
  var parse = root_2P
  tree.settings.core.data = parse
  tree.refresh(false, false)
  typeLabelInfo6('')
  if (!flagOpros) {
    LoadConfFromDevice()
  } else {
    flagOpros = false
    flagOpen = false
    $('#startOnes')
      .prop('innerHTML', 'Start receiving')
      .css({ color: '#3ec97a' })
    setTimeout(() => {
      LoadConfFromDevice()
    }, 1000)
  }
  return true
})
//===================================================
function ReadWord_16(data, i) {
  const tmp = (data[i] & 0xff) + ((data[i + 1] & 0xff) << 8)
  return tmp
}
//===================================================
function ReadWord_32(data, i) {
  const tmp =
    (data[i] & 0xff) +
    ((data[i + 1] & 0xff) << 8) +
    ((data[i + 2] & 0xff) << 16) +
    ((data[i + 3] & 0xff) << 24)
  return tmp
}
//===================================================
function startCmd_2(unit) {
  txDev = {
    id_dev: currDevice.ser,
    cmd: 2,
    n_unit: unit,
  }
  //console.log('tx cmd_2: ', txDev)
  sbusPktSend(txDev)
}
//===================================================
function startCmd_3(id_un, n_pr) {
  //console.log('cmd_3 id: ', id_un, 'nPar: ', n_pr)
  txDev = {
    id_dev: currDevice.ser,
    cmd: 3,
    id_unit: id_un,
    n_par: n_pr,
  }
  //countTxR = 5
  sbusPktSend(txDev)
  // clearInterval(timeOutTxPrt)
  // timeOutTxPrt = setInterval(() => {
  //   if (countTxR) {
  //     countTxR--
  //     console.log('----------------------Cmd3 send R', countTxR)
  //     sbusPktSend(txDev)
  //   }
  // }, 1000)
}
//===================================================
function convByteArrToStr(data, k, len) {
  var buf = new Uint8Array(len)
  for (let i = 0; i < len; i++) {
    buf[i] = data[i + k]
  }
  let td = new TextDecoder('cp1251')
  let str = td.decode(buf)
  return str
}
//================================================
function hexToFloat(str, precision) {
  var number = 0,
    sign,
    order,
    mantiss,
    exp,
    i
  if (str.length <= 6) {
    exp = parseInt(str, 16)
    sign = exp >> 16 ? -1 : 1
    mantiss = ((exp >> 12) & 255) - 127
    order = ((exp & 2047) + 2048).toString(2)
    for (i = 0; i < order.length; i += 1) {
      number += parseInt(order[i], 10) ? Math.pow(2, mantiss) : 0
      mantiss--
    }
  } else if (str.length <= 10) {
    exp = parseInt(str, 16)
    sign = exp >> 31 ? -1 : 1
    mantiss = ((exp >> 23) & 255) - 127
    order = ((exp & 8388607) + 8388608).toString(2)
    for (i = 0; i < order.length; i += 1) {
      number += parseInt(order[i], 10) ? Math.pow(2, mantiss) : 0
      mantiss--
    }
  }
  //console.log('number: ', number)
  if (precision === 0 || precision) {
    return (number * sign).toFixed(precision).toString(10)
  }
  return (number * sign).toString(5)
}

//===================================================
// function hexToFloat(hex) {
//   var s = hex >> 31 ? -1 : 1
//   var e = (hex >> 23) & 0xff
//   var f =
//     ((((hex & 0x7fffff) | 0x800000) * 1.0) / Math.pow(2, 23)) *
//     Math.pow(2, e - 127)
//   // if (f > 4294967295) return 'NaN'
//   // if (f < 0.0001) f = 0
//   f = s * f
//   return f.toFixed(5)
// }
//===================================================
function decToHex(dec) {
  if (dec > 281474976710655) return 'NaN'
  if (dec < -140737488355299) return 'NaN'
  if (dec < 0) dec = 0xffffffffffff + dec + 1
  return '0x' + dec.toString(16)
}

//===================================================
function byteToUint(byteArray) {
  var value = 0
  for (var i = byteArray.length - 1; i >= 0; i--) {
    value = value * 256 + byteArray[i]
  }
  return value
}
//===================================================
function byteToInt(bytes) {
  var ret = 0
  let len = bytes.length - 1
  if (bytes[len] >= 128) {
    // negative number
    bytes.forEach((val, i) => {
      ret += (255 - val) * 256 ** i
    })
    ret = ret * -1 - 1
  } else
    bytes.forEach((val, i) => {
      ret += val * 256 ** i
    })
  return ret
}
//===================================================
function convRegParseToString(prop, dt) {
  const len = dt.length
  let arr = new Uint8Array(len)
  for (var i = 0; i < len; i++) arr[i] = dt[i]
  const reg = byteToUint(dt)
  const parsHex = decToHex(reg)
  //console.log('reg:', reg, parsHex)
  let tmp = 0
  switch (prop & 0xf) {
    case 0: //type = 'Char'
      const td = new TextDecoder('cp1251')
      let str = td.decode(arr)
      //console.log('str:', dt, arr, str)
      if (arr[0] == 0) {
        str = 'NaN'
      }
      return str
    case 1: //type = 'Int'
      tmp = byteToInt(dt)
      //console.log('int:', reg, tmp)
      return `${tmp}`
    case 2: //type = 'Uint'
      tmp = parseInt(parsHex, 16)
      return `${tmp}`
    case 3:
      if (reg) return 'yes'
      else return 'no'
    case 4:
      return hexToFloat(parsHex, 3)
    //return parseFloat('0x' + parsHex)
    case 5: //type = 'Hex'
      return parsHex
    case 7: //type = 'Time'
      //var d = new Date(reg - 10800000)
      //console.log('reg_time:', convertTime(reg))
      return convertTime(reg)
  }
  return undefined
}
//--------------------------------------------------
function addZeroDig(dig) {
  let str = ''
  if (dig < 10) str = '0'
  return str
}
//--------------------------------------------------
function convertTime(msecs) {
  let hours = msecs / (1000 * 60 * 60)
  hours = parseInt(hours, 10)
  let minutes = (msecs - hours * 1000 * 60 * 60) / (1000 * 60)
  minutes = parseInt(minutes, 10)
  let seconds = (msecs - minutes * 1000 * 60 - hours * 1000 * 60 * 60) / 1000
  seconds = parseInt(seconds, 10)
  return (
    addZeroDig(hours) +
    hours +
    ':' +
    addZeroDig(minutes) +
    minutes +
    ':' +
    addZeroDig(seconds) +
    seconds
  )
}
//===================================================
function parseArrayTreeRoot(dev) {
  root_2P = []
  let k = 0
  //--------------------------------------
  for (let i = 0; i < dev.uNum; i++) {
    let id = dev.unit[i].idUnit
    let pare = 'j1_' + dev.unit[i].idParent
    let open = false
    if (id == dev.unit[i].idParent) {
      pare = '#'
      open = true
    }
    const unit_s = {
      id: 'j1_' + id,
      text: dev.unit[i].name,
      icon: true,
      li_attr: { id: 'j1_' + id },
      a_attr: {
        href: '#',
        id: 'j1_' + id + '_anchor',
        style: 'color: #bd0000; font-weight:bold; background-color: #f5fff5',
        class: 'bkgGrya1',
      },
      state: {
        loaded: true,
        opened: open,
        selected: false,
        disabled: false,
        checked: false,
      },
      data: {
        id_par: `${dev.unit[i].idUnit}`,
        textColor: 'txt_IdDev',
      },
      parent: pare,
    }
    root_2P[k++] = unit_s
    k = parseUnitTreeRoot(dev.unit[i], k)
  }
}
//===================================================
function parseDataTreeRoot(dt, nU) {
  var tree = $('div#treeDevice').jstree(true)
  const idU = dt[6]
  const nPar = dt[8]
  if (nPar != currDevice.unit[nU].nParam) return
  let k = 9
  let lPar = 0
  for (let i = 0; i < nPar; i++) {
    lPar = dt[k++]
    let tmp = []
    let t = 0
    for (; t < lPar; t++) {
      tmp[t] = dt[k + t]
    }
    k += t
    const dataRx = convRegParseToString(currDevice.unit[nU].param[i].prop, tmp)
    const currRx = currDevice.unit[nU].param[i].data
    //if (nU == 1 && i == 2) console.log('dataRx:', currRx, dataRx)
    if (dataRx !== currRx || countOpenUnit) {
      //console.log(dataRx, currRx, countOpenUnit)
      currDevice.unit[nU].param[i].data = dataRx
      const m = i
      const id = 'j1_' + idU + `${m}`
      //if (nU == 1 && i == 2) console.log('rx id:', id, dataRx)
      var node = tree.get_node(id)
      node.data.value = dataRx
      const prop = currDevice.unit[nU].param[i].prop
      if ((prop & 0xf) == 0) {
        currDevice.unit[nU].param[i].len = dataRx.length
        node.data.leng = `${dataRx.length}`
        //console.log(dataRx.length, dataRx)
      }
      //pktRxCount++
      tree.trigger('change_node.jstree', node)
    }
  }

  if (countOpenUnit) {
    //console.log('countOpenUnit:', countOpenUnit)
    countOpenUnit--
  }
}
//=================================================== Packet from device
let RxBuf = new ArrayBuffer(512)
let RxTail = 0
let RxFlag = false
//-----------------------------------
function myFuncPostUDP(msgData) {
  let RxHex = new ArrayBuffer(32)
  let len = 0
  let str = ''
  //console.log('msgData:', msgData)
  if (msgData.length < 2 && RxTail == 0) {
    RxBuf[RxTail++] = msgData[0]
    return
  }
  for (let i = 0; i < msgData.length; i++) {
    RxHex[RxTail] = decToHex(msgData[i])
    RxBuf[RxTail++] = msgData[i]
  }
  if (
    ReadWord_16(RxBuf, 0) == 0xfdca &&
    ReadWord_16(RxBuf, 2) == currDevice.ser
  ) {
    const acrc = CRC16(RxBuf, RxTail - 2)
    const pcrc = ReadWord_16(RxBuf, RxTail - 2)
    //console.log('RX msg1:', RxBuf, RxTail)
    if (acrc == pcrc) {
      //console.log('RX msg2:', RxBuf, RxTail)
      RxTail = 0
      //RxFlag = false
      clearInterval(timeOutTxPrt)
      const cmd = RxBuf[5]
      switch (cmd) {
        case 1:
          currDevice.uNum = RxBuf[6]
          //console.log('RX cmd 1:', RxBuf[6])
          numUnit = 0
          setTimeout(() => {
            startCmd_2(numUnit)
          }, 50)
          document.getElementById('loadInfo1').innerHTML =
            'Loading configuration from device:'
          break
        case 2:
          len = RxBuf[4] - 4
          str = convByteArrToStr(RxBuf, 9, len)
          //console.log('cmd2 str: ', str)
          document.getElementById('loadInfo2').innerHTML =
            'Node loaded: ' + str
          const unit = {
            opened: false,
            idParent: RxBuf[6],
            idUnit: RxBuf[7],
            nParam: RxBuf[8],
            name: str,
            param: [],
          }
          currDevice.unit[numUnit++] = unit
          if (numUnit < currDevice.uNum) {
            setTimeout(() => {
              startCmd_2(numUnit)
            }, 50)
          } else {
            //console.log('currDevice cmd2:', currDevice)
            numUnit = 0
            numPar = 0
            while (!currDevice.unit[numUnit].nParam) numUnit++
            setTimeout(() => {
              startCmd_3(currDevice.unit[numUnit].idUnit, numPar)
              countTxR = 10
            }, 50)
          }
          break
        case 3:
          len = RxBuf[4] - 5
          //-----------------------------------
          // var buf = new Uint8Array(len)
          // for (let i = 0; i < len; i++) {
          //   buf[i] = RxBuf[i + 12]
          // }
          //-----------------------------------
          str = convByteArrToStr(RxBuf, 10, len)
          document.getElementById('loadInfo2').innerHTML =
            'Parameter loaded: ' + str
          //console.log('str cmd3:', str)
          const par = {
            check: false,
            prop: RxBuf[8],
            len: RxBuf[9],
            name: str,
            data: '',
          }
          if (!currDevice.unit.length) break
          currDevice.unit[numUnit].param[numPar++] = par
          if (numPar >= currDevice.unit[numUnit].nParam) {
            numUnit++
            numPar = 0
          }
          if (numUnit < currDevice.uNum) {
            //console.log('currDevice cmd3:', currDevice)
            setTimeout(() => {
              startCmd_3(currDevice.unit[numUnit].idUnit, numPar)
            }, 50)
          } else {
            currDevice.load = 'device'
            //console.log('currDevice cmd3:', currDevice)
            parseArrayTreeRoot(currDevice)
            //rowsTreeBgrColor('div#treeDevice')
            var tree = $('div#treeDevice').jstree(true)
            var parse = root_2P
            tree.settings.core.data = parse
            tree.refresh(true, false)
            //--------------------------------------------
            document.getElementById('loadInfo1').innerHTML =
              'Loaded configuration from device:'
            if (flagCheckSel == 2) {
              document.getElementById('loadInfo2').innerHTML =
                'S/N: ' +
                currDevice.ser +
                ', IP: ' +
                currDevice.ip +
                ', Port: ' +
                currDevice.port
            } else if (flagCheckSel == 1) {
              document.getElementById('loadInfo2').innerHTML =
                'S/N: ' +
                currDevice.ser +
                ', ' +
                currDevice.com +
                ', Boud rate: ' +
                currDevice.boud
            }
            //--------------------------------------------
            $('div#treeDevice').jstree('uncheck_all')
            checkDevices = []
            flagLoadConfig = false
            numUnit = 0
            if (flagOpros) {
              setTimeout(() => {
                startOnesOpros()
              }, 250)
            }
          }
          break
        case 4:
          // $('div#treeDevice').on('select_node.jstree', function (e, data) {
          //   console.log('select_node 2: ', numUnit)
          //   stopOproc()
          // })
          parseDataTreeRoot(RxBuf, numUnit)
          numUnit++
          if (numUnit >= currDevice.uNum) numUnit = 0
          if (flagOpros) {
            setTimeout(() => {
              startOnesOpros()
            }, 20)
            pktRxCount++
          }
          break
        case 5:
          //flagOpros = true
          console.log('Rx cmd5:', flagCmd5)
          flagCmd5 = false
          let kk = 0
          for (let i = 0; i < currDevice.uNum; i++) {
            if (currDevice.unit[i].opened) kk++
          }
          countOpenUnit = kk
                // if (flagSendList) {
          //   //console.log('Cmd11 SendList:')
          //   if (sendConnectTable()) {
          //     flagSendList = false
          //     clearInterval(timeOutSendTab)
          //     console.log('List loading complete!:', countSend)
          //     setTimeout(() => {
          //       //startStopOproc()
          //     }, 500)
          //   }
          // } else {
          setTimeout(() => {
            startOproc()
          }, 100)
          //}
          break
        default:
          break
      }
    }
  }
}
//==================================================
function startOneTimer() {
  setTimeout(() => {
    //sendDataUDP(JSON.stringify(newArr))
  }, 1000)
}
//===================================================
async function clientConnect(dev) {
  flagConnect = false
  if (flagCheckSel == 2) {
    client = udp.createSocket('udp4')
    const port = dev.port
    //console.log('Client UDP port:', port)
    await client.bind({
      //address: 'localhost',
      //address: '172.16.200.1',
      port: +port + 100,
      exclusive: false,
    })
    client.on('error', (err) => {
      console.log(`server error:\n${err.stack}`)
      client.close()
      console.log('Connection error!')
      //alert('Ошибка соединение!')
    })
    client.on('message', (msg, info) => {
      // console.log('Data received from server : ' + msg.toString())
      // console.log(
      //   'Received %d bytes from %s:%d\n',
      //   msg.length,
      //   info.address,
      //   info.port
      // )
      //console.log('Client msg:', msg)
      myFuncPostUDP(msg)
    })
    //console.log('UDP connection established!')
    flagConnect = true
  } else if (flagCheckSel == 1) {
    //console.log('Client dev:', dev)
    const boud = dev.boud
    comPort = new SerialPort(
      {
        path: dev.com,
        baudRate: +boud,
        databits: 8,
        parity: 'none',
        dtr: false,
      },
      function (err) {
        if (err) {
          stopOproc()
          console.log('Port Error: ', err.message)
        }
      }
    )
    comPort.on('data', function (data) {
      try {
        myFuncPostUDP(data)
      } catch (err) {
        console.log('Oops', err)
        return false
      }
    })
    setTimeout(() => {
      comPort.set({ dtr: false, rts: false })
      setTimeout(() => {
        flagConnect = true
        //console.log('clientConnect:', flagConnect)
      }, 250)
    }, 250)
  }
}

//================================================== Start request
//let countTxR = 0
function startOnesOpros() {
  while (!currDevice.unit[numUnit].nParam) {
    numUnit++
    if (numUnit >= currDevice.uNum) numUnit = 0
  }
  let flag = false
  while (!currDevice.unit[numUnit].opened) {
    numUnit++
    if (numUnit >= currDevice.uNum) {
      if (!flag) {
        numUnit = 0
        flag = true
      } else {
        console.log('Start request: No open nodes!')
        flagOpen = false
        return
      }
    }
  }
  if (currDevice.unit[numUnit].opened) {
    //console.log('numUnit:', numUnit)
    txDev = {
      id_dev: currDevice.ser,
      cmd: 4,
      id_unit: currDevice.unit[numUnit].idUnit,
      n_par: 0,
      l_par: currDevice.unit[numUnit].nParam,
    }
    sbusPktSend(txDev)
    clearInterval(timeOutTxPrt)
    timeOutTxPrt = setInterval(() => {
      console.log('---Cmd 4 num unit:', numUnit)
      sbusPktSend(txDev)
    }, 1000)
  } else {
    numUnit++
    if (numUnit >= currDevice.uNum) numUnit = 0
  }
}
//==========================================================================
function startOproc() {
  if (!flagOpros && flagConnect) {
    numUnit = 0
    startOnesOpros()
    $('#startOnes')
      .prop('innerHTML', 'Stop request')
      .css({ color: '#e00000' })
    typeLabelInfo5('Request started!', '#00a000')
    flagOpros = true
  }
}
//-------------------------------------------------------
function stopOproc() {
  //if (!flagConnect) return
  if (flagOpros) {
    flagOpros = false
    setTimeout(() => {
      clearInterval(timeOutTxPrt)
    }, 500)
    $('#startOnes')
      .prop('innerHTML', 'Run request')
      .css({ color: '#019101' })
    typeLabelInfo5('Request stopped!', '#e00000')
  }
}
//=================================================== One-time request
$('a#startOnes').click(function () {
  if (!flagConnect) {
    clientConnect(currDevice)
    setTimeout(() => {
      numUnit = 0
      startOproc()
      flagKnStart = true
    }, 600)
  } else {
    if (!flagOpros) {
      startOproc()
      flagKnStart = true
    } else {
      stopOproc()
      flagKnStart = false
    }
  }
})
//==========================================================================
function closeConnect() {
  if (flagConnect) {
    if (flagCheckSel == 1) comPort.close()
    else if (flagCheckSel == 2) client.close()
    flagConnect = false
    console.log('Connection lost!')
  }
}
//==========================================================================
