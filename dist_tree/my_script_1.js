var $ = (jQuery = require('jquery'))
require('jstree')
require('jstreegrid')
//const { privateDecrypt } = require('crypto')
const fs = require('fs')
const path = require('path')
const storage = require('electron-json-storage')
const ipcRend = require('electron').ipcRenderer
//const util = require('util')
const iconv = require('iconv-lite')
//==========================================================================
const udp = require('dgram')
var client = udp.createSocket('udp4')
var comPorts = []
//==========================================================================
var nodeCellSelect = undefined
let varOldCell = ''
let selectCell = false
let inputCell = false
let flagOpros = false
let flagConnect = false
let flagCmd5 = false
let flagKnStart = false
var txDev = []
let numUnit = 0
let numPar = 0
var currDevice = []
var root_2P = []
var openNode = []
var checkDevices = []
let flagCheckSel = 0
let numComPort = ''
let numBoudRate = 0
let numIpAddr = ''
let numIpPort = 0
let numSerNum = 0
let pktTxCount = 0
let pktTxSec = 0
let pktRxCount = 0
let pktRxSec = 0
let fileCurrent = ''
//==========================================================================
// let startDate = Date.now()
let myTimerEvent = 0
let flagOpen = false
var currFavor = {
  device: {},
  favor: [],
}
//==========================================================================
var { SerialPort } = require('serialport')
var comPort = 0

async function listSerialPorts() {
  await SerialPort.list().then((ports, err) => {
    if (err) {
      console.log(err.message)
      return
    } else {
      //console.log('no err')
    }
    if (ports.length === 0) {
      console.log('No ports discovered')
    }
    var selComPort = document.getElementById('selComPort')
    let num = selComPort.options.length
    if (num) {
      while (num) {
        num = num - 1
        selComPort.removeChild(selComPort.childNodes[num])
      }
    }
    for (const i in ports) {
      comPorts[i] = ports[i].path
    }
    for (let i = 0; i < ports.length; i++) {
      let newOption = new Option(ports[i].path, ports[i].path)
      selComPort.add(newOption, undefined)
    }
    //console.log('selComPort', selComPort.options)
    //console.log('comPorts', comPorts)
  })
}
//===================================================
function setColorCheckRow(flag) {
  if (flag == 1) {
    $('#labelIpAddr').css({ color: '#dcdcdc' })
    $('#labelOpros').css({ color: '#dcdcdc' })
    $('#ipNum').css({ color: '#dcdcdc' })
    $('#portNum').css({ color: '#dcdcdc' })

    $('#labelComPort').css({ color: '#004400' })
    $('#labelBoud').css({ color: '#004400' })
    $('#selComPort').css({ color: '#000000' })
    $('#selBoudRate').css({ color: '#000000' })
  } else {
    $('#labelIpAddr').css({ color: '#004400' })
    $('#labelOpros').css({ color: '#004400' })
    $('#ipNum').css({ color: '#000000' })
    $('#portNum').css({ color: '#000000' })

    $('#labelComPort').css({ color: '#dcdcdc' })
    $('#labelBoud').css({ color: '#dcdcdc' })
    $('#selComPort').css({ color: '#dcdcdc' })
    $('#selBoudRate').css({ color: '#dcdcdc' })
  }
}
//===================================================
function selectCheck1() {
  let sel1 = $('#select1').is(':checked')

  if (flagCheckSel == 1) {
    $('#select2').prop('checked', false)
    $('#select1').prop('checked', true)
    return
  }

  if (sel1) {
    $('#select2').prop('checked', false)
    $('#select1').prop('checked', true)
    flagCheckSel = 1
    //---------------------------------
    stopOproc()
    listSerialPorts()
    //---------------------------------
    let flag = false
    for (const i in comPorts) {
      //console.log('comPorts: ', comPorts, currFavor.device.com)
      if (comPorts[i] == numComPort) {
        flag = true
        break
      }
    }
    if (!flag) {
      typeLabelInfo5('Port ' + numComPort + ' missing!', '#e00000')
      return
    }
    var serNum = document.getElementById('serNum')
    currDevice.com = numComPort
    currDevice.boud = numBoudRate
    currDevice.ser = numSerNum = serNum.value
    $('#loadInfo2')
      .prop(
        'innerHTML',
        'S/N: ' +
          currDevice.ser +
          ', ' +
          currDevice.com +
          ', Boud rate: ' +
          currDevice.boud
      )
      .css({ color: '#0004db' })
    //-------------------------------------
    if (currFavor.favor.length) {
      clearCheckToCurrDev()
    }
    //---------------------------------
    closeConnect()
    flagOpros = false
    setTimeout(() => {
      clearInterval(timeOutTxPrt)
    }, 500)
    // $('#startOnes')
    //   .prop('innerHTML', 'Запустить опрос')
    //   .css({ color: '#019101' })
    //---------------------------------
    setColorCheckRow(flagCheckSel)
    numComPort = document.getElementById('selComPort').value
    numBoudRate = document.getElementById('selBoudRate').value
    console.log('selComPort: ', numComPort, numBoudRate)
    storage.get('config', function (error, data) {
      if (error) throw error
      storage.set(
        'config',
        {
          check: flagCheckSel,
          com: numComPort,
          boud: numBoudRate,
          ip: data.ip,
          port: data.port,
          ser: data.ser,
          fileCurr: fileCurrent,
        },
        function (error) {
          if (error) throw error
        }
      )
    })
  }
}
//===================================================
function selectCheck2() {
  let sel2 = $('#select2').is(':checked')

  if (flagCheckSel == 2) {
    $('#select1').prop('checked', false)
    $('#select2').prop('checked', true)
    return
  }

  if (sel2) {
    $('#select1').prop('checked', false)
    $('#select2').prop('checked', true)
    flagCheckSel = 2
    //---------------------------------
    stopOproc()
    listSerialPorts()
    //---------------------------------
    var ipNum = document.getElementById('ipNum')
    var portNum = document.getElementById('portNum')
    var serNum = document.getElementById('serNum')

    currDevice.ip = numIpAddr = ipNum.value
    currDevice.port = numIpPort = portNum.value
    currDevice.ser = numSerNum = serNum.value

    $('#loadInfo2')
      .prop(
        'innerHTML',
        'S/N: ' +
          currDevice.ser +
          ', IP: ' +
          currDevice.ip +
          ', Port: ' +
          currDevice.port
      )
      .css({ color: '#0004db' })
    //---------------------------------
    if (currFavor.favor.length) {
      clearCheckToCurrDev()
    }
    //---------------------------------
    closeConnect()
    flagOpros = false
    setTimeout(() => {
      clearInterval(timeOutTxPrt)
    }, 500)
    // $('#startOnes')
    //   .prop('innerHTML', 'Запустить опрос')
    //   .css({ color: '#019101' })
    //---------------------------------
    setColorCheckRow(flagCheckSel)
    storage.get('config', function (error, data) {
      if (error) throw error
      storage.set(
        'config',
        {
          check: flagCheckSel,
          com: data.com,
          boud: data.boud,
          ip: data.ip,
          port: data.port,
          ser: data.ser,
          fileCurr: fileCurrent,
        },
        function (error) {
          if (error) throw error
        }
      )
    })
  }
}
//===================================================
function updataComPort() {
  console.log('updataComPort', numComPort)
  listSerialPorts()
  const selConPort = document.getElementById('selComPort')
  selectComPort(selConPort)
}
//------------------------------------
function selectComPort(selectObject) {
  stopOproc()
  var value = selectObject.value
  console.log('selectComPort', value)
  numComPort = value
  storage.get('config', function (error, data) {
    if (error) throw error
    storage.set(
      'config',
      {
        check: data.check,
        com: value,
        boud: data.boud,
        ip: data.ip,
        port: data.port,
        ser: data.ser,
        fileCurr: fileCurrent,
      },
      function (error) {
        if (error) throw error
      }
    )
  })
}
//------------------------------------
function selectBoudRate(selectObject) {
  stopOproc()
  var value = selectObject.value
  console.log('selectBoudRate', value)
  numBoudRate = value
  storage.get('config', function (error, data) {
    if (error) throw error
    storage.set(
      'config',
      {
        check: data.check,
        com: data.com,
        boud: value,
        ip: data.ip,
        port: data.port,
        ser: data.ser,
        fileCurr: fileCurrent,
      },
      function (error) {
        if (error) throw error
      }
    )
  })
}
//=========================================== Loading and saving settings
loadConfigInit()
startTimersSecond()
//---------------------------------------------------
function loadConfigInit() {
  //storage.setDataPath(os.tmpdir())
  //const filePath = 'D:\\VSC_projects\\sbus_config_device_udp_com\\init'
  let filePath = path.join(__dirname, 'init')
  if (filePath.includes('\\app.asar\\'))
    filePath = filePath.replace('\\app.asar\\', '\\')
  console.log('FilePath:', filePath)
  storage.setDataPath(filePath)
  //const dataPath = storage.getDataPath()
  //console.log('dataPath:', dataPath)

  var comPort = document.getElementById('selComPort')
  var boudRate = document.getElementById('selBoudRate')
  var ipNum = document.getElementById('ipNum')
  var portNum = document.getElementById('portNum')
  var serNum = document.getElementById('serNum')
  var selCheck1 = document.getElementById('select1')
  var selCheck2 = document.getElementById('select2')
  // storage.clear(function (error) {
  //   if (error) throw error
  // })
  storage.has('config', function (error, hasKey) {
    if (error) throw error
    //console.log('hasKey:', hasKey)
    if (!hasKey) {
      fileCurrent = ''
      setStorageData()
      return
    }
  })
  storage.get('config', function (error, data) {
    if (error) throw error
    numIpAddr = ipNum.value = data.ip
    numIpPort = portNum.value = data.port
    numSerNum = serNum.value = data.ser

    // numComPort = comPort.value = data.com
    // numBoudRate = boudRate.value = data.boud

    const checkSel = data.check
    numComPort = data.com
    numBoudRate = data.boud
    fileCurrent = data.fileCurr
    //console.log('storage:', checkSel, comSel, boudSel)

    comPort.addEventListener('change', setStorageData, false)
    boudRate.addEventListener('change', setStorageData, false)
    ipNum.addEventListener('change', setStorageData, false)
    portNum.addEventListener('change', setStorageData, false)
    serNum.addEventListener('change', setStorageData, false)

    selectElement('selComPort', data.com)
    selectElement('selBoudRate', data.boud)

    if (checkSel == '1') {
      selCheck1.checked = true
      selCheck2.checked = false
      flagCheckSel = 1
    } else {
      selCheck2.checked = true
      selCheck1.checked = false
      flagCheckSel = 2
    }
    setColorCheckRow(flagCheckSel)
    //console.log('flagCheckSel:', flagCheckSel, numComPort, numBoudRate)
    if (existFilePath(fileCurrent)) {
      loadConfFromFile(fileCurrent)
    }
  })
  // console.log('dblclick start', nodeCellSelect)
  // $(document).on('click', 'div#treeDevice', function (e) {
  //   console.log('click mouse', nodeCellSelect)
  // })
  // document.getElementById('treeDevice').onclick = function(e){
  //   console.log('click mouse', nodeCellSelect)
  // }
}
//--------------------------------------------------------------------
function selectElement(id, valueToSelect) {
  let element = document.getElementById(id)
  element.value = valueToSelect
}
//--------------------------------------------------------------------
function setStorageData() {
  console.log('setStorageData:')
  stopOproc()

  const comPort = document.getElementById('selComPort').value
  const boudRate = document.getElementById('selBoudRate').value
  const ipNum = document.getElementById('ipNum').value
  const portNum = document.getElementById('portNum').value
  const serNum = document.getElementById('serNum').value

  currDevice.ser = numSerNum = serNum
  currDevice.port = numIpPort = portNum
  currDevice.ip = numIpAddr = ipNum

  currDevice.com = numComPort = comPort
  currDevice.boud = numBoudRate = boudRate

  storage.set(
    'config',
    {
      check: flagCheckSel,
      com: comPort,
      boud: boudRate,
      ip: ipNum,
      port: portNum,
      ser: serNum,
      fileCurr: fileCurrent,
    },
    function (error) {
      if (error) throw error
    }
  )
}
//========================================================================
function startTimersSecond() {
  timeOutPktCalcSecond = setInterval(() => {
    //console.log('startTimersSecond')
    pktTxSec = pktTxCount
    pktRxSec = pktRxCount
    pktTxCount = 0
    pktRxCount = 0
    document.getElementById('loadInfo3').innerHTML = `${pktTxSec}`
    document.getElementById('loadInfo4').innerHTML = `${pktRxSec}`
    //----------------------------------------
    //   if (timerCount) {
    //     timerCount--
    //     document.getElementById('loadInfo6').innerHTML = `${timerCount}`
    //   }
  }, 1000)
}
//=================================================================== Tree
// html demo
//$('#html').jstree()
listSerialPorts()

$('div#treeDevice').jstree({
  plugins: [
    'checkbox',
    'contextmenu',
    //'state',
    'core',
    //'themes',
    'json',
    'grid',
    //'hotkeys',
    //'ui',
    //'wholerow',
  ],
  contextmenu: {
    select_node: true,
    items: reportMenu,
  },
  checkbox: {
    keep_selected_style: false,
    three_state: false,
    whole_node: false,
    tie_selection: false,
  },
  core: {
    data: root_2P,
    check_callback: true,
    dblclick_toggle: true,
    rtl: false,
    animation: 0,
  },
  // allowPaging: true,
  //  editable: true,
  //  editaction: 'dblclick',
  // editSettings: {
  //   allowAdding: true,
  //   allowEditing: true,
  //   allowDeleting: true,
  //   mode: 'Cell',
  // },
  grid: {
    width: 600,
    height: 900,
    columns: [
      {
        headerClass: 'title_style',
        wideCellClass: 'bkgGrya1',
        valueClass: 'textColor',
        width: 'auto',
        header: 'Configuration units',
        title: '_DATA_',
        tree: true,
      },
      {
        headerClass: 'title_style',
        wideCellClass: 'bkgGryaVal',
        valueClass: 'textColor',
        value: 'value',
        width: 'auto',
        header: '  Value ',
        title: 'value',
        editable: true,
        // cellEditor: CustomElementRegistry,
      },
      {
        headerClass: 'title_style',
        wideCellClass: 'bkgGryaID',
        valueClass: 'textColor',
        value: 'id_par',
        width: 50,
        header: 'ID',
        title: 'id_par',
      },
      {
        headerClass: 'title_style',
        wideCellClass: 'bkgGrya',
        valueClass: 'textColor',
        value: 'type',
        width: 50,
        header: 'Type',
        title: 'type',
      },
      {
        headerClass: 'title_style',
        wideCellClass: 'bkgGrya',
        valueClass: 'textColor',
        value: 'atrib',
        width: 50,
        header: 'Atrib',
        title: 'atrib',
      },
      {
        headerClass: 'title_style',
        wideCellClass: 'bkgGrya',
        valueClass: 'textColor',
        value: 'leng',
        width: 50,
        header: 'Bytes',
        title: 'leng',
        editable: true,
      },
    ],
    resizable: false,
    //draggable: true,
    contextmenu: true,
    select_node: true,
    gridcontextmenu: function (grid, tree, node, val, col, t, target) {
      return {
        edit: {
          label: 'Изменить',
          icon: './img/open.gif',
          action: function (data) {
            var obj = t.get_node(node)
            grid._edit(obj, col, target)
            //console.log('gridcontextmenu:')
            selectWriteProp(col, obj, node)
          },
        },
      }
    },
  },
})
//==================================================
function openCloseNode(node) {
  //if (node.parent == 'j1_1') {
  //console.log('node:', node)
  // console.log('openNode:', openNode)
  let flag = false
  for (let i = 0; i < openNode.length; i++) {
    if (node.id == openNode[i]) {
      $('div#treeDevice').jstree(true).close_node(node.id)
      flag = true
      //console.log('Opened node:', openNode)
      break
    }
  }
  if (!flag) {
    $('div#treeDevice').jstree(true).open_node(node.id)
    //console.log('Closed node:', openNode)
  }
  //}
}
//==================================================
function checkOpenCloseNode(node) {
  //console.log('checkOpenCloseNode:', node)
  var check = node.state.checked
  if (check) {
    node.state.checked = false
    deletUncheckNode(node)
  } else {
    node.state.checked = true
    loadCheckDevices(node)
  }
}
//==================================================
function reportMenu(node) {
  //console.log('reportMenu1:', node)
}
//==================================================
function cellSelectUpdate(unit, data) {
  //console.log('cellSelect:', data)
  flagCmd5 = true
  const atrib = data.data.atrib
  varOldCell = data.data.value
  if (atrib != 'WR') return
  nodeCellSelect = data
  if (!inputCell) {
    stopOproc()
    data.data.value =
      '<input class="inpCellStyle" type="text" id="myInp" value="' +
      `${varOldCell}` +
      '" />'
    inputCell = true
    setTimeout(() => {
      const myInp = document.getElementById('myInp')
      //console.log('myInp:', myInp)
      myInp.select()
      myInp.focus()
      myInp.onkeydown = (evt) => {
        if (evt.key == 'Enter') {
          inputCell = false
          nodeCellSelect.data.value = myInp.value
          updateDataCell(unit, nodeCellSelect, myInp.value, varOldCell)
          $('div#treeDevice')
            .jstree(true)
            .trigger('change_node.jstree', nodeCellSelect)
          console.log('Enter: ', nodeCellSelect.type, myInp.value)
          nodeCellSelect = undefined
        } else if (evt.key == 'Escape') {
          inputCell = false
          flag_editable = false
          nodeCellSelect.data.value = varOldCell
          //$('#myInp').blur()
          $('div#treeDevice')
            .jstree(true)
            .trigger('change_node.jstree', nodeCellSelect)
          console.log('Escape: ', myInp.value)
          nodeCellSelect = undefined
          startOproc()
        }
      }
    }, 200)
  }
}
//================================================
function selectWriteProp(col, data, node) {
  //console.log('selectWriteProp 1:', col.header, data.data.atrib)
  if (col.header == '  Value ' && data.data.atrib == 'WR') {
    console.log('selectWriteProp:', flagOpros)
    stopOproc()
    flagCmd5 = true
    typeLabelInfo5('Press "Enter" or "Escape"  ', '#ff0000')
    //--------------------------
    $(document).on('keydown', function (event) {
      if (event.key == 'Escape' || event.key == 'Enter') {
        console.log('keydown:', event.key)
        event.preventDefault()
        startOproc()
        flagCmd5 = false
        $(document).off('keydown')
      }
    })
    //--------------------------
    // flagCmd5 = true
    // setTimeout(() => {
    //   startOproc()
    //   flagCmd5 = false
    // }, 30000)
  } else if (col.header == '  Value ' && data.data.atrib == 'CNTR') {
    stopOproc()
    $('div#treeDevice').jstree(true).redraw_node(node)
  } else {
    $('div#treeDevice').jstree(true).redraw_node(node)
  }
}
//==================================================
//let countCmd11 = 0
//-------------------------------------------------------
function floatToNumber(flt) {
  var sign = flt < 0 ? 1 : 0
  flt = Math.abs(flt)
  var exponent = Math.floor(Math.log(flt) / Math.LN2)
  var mantissa = flt / Math.pow(2, exponent)
  return (
    (sign << 31) |
    ((exponent + 127) << 23) |
    ((mantissa * Math.pow(2, 23)) & 0x7fffff)
  )
}
//-------------------------------------------------------
function updateTypeFloat(flt) {
  var sign = flt < 0 ? 1 : 0
  flt = Math.abs(flt)
  if (!flt) return NaN
  var exponent = Math.floor(Math.log(flt) / Math.LN2)
  var mantissa = flt / Math.pow(2, exponent)
  console.log('floatToNumber:', flt, exponent, mantissa)
  return (
    (sign << 31) |
    ((exponent + 127) << 23) |
    ((mantissa * Math.pow(2, 23)) & 0x7fffff)
  )
}
//==================================================
function updateTypeBool(val, old) {
  if (val == 'y' || val == '1' || val == 'yes' || val == 'да') {
    return 'yes'
  } else if (val == 'n' || val == '0' || val == 'no' || val == 'нет') {
    return 'no'
  } else {
    return old
  }
}
//==================================================
function text2Binary(text) {
  var length = text.length,
    output = []
  for (var i = length - 1; i >= 0; i--) {
    var bin = text[i].charCodeAt().toString(16)
    output.push(Array(8 - bin.length + 1).join('') + bin)
  }
  return output.join('')
}
//---------------------------------------------------
function textToBytes(text) {
  output = []
  for (var i = 0; i < text.length; i++) {
    var bin = text[i].charCodeAt().toString(16)
    output[i] = parseInt(bin, 16) & 0xff
  }
  return output
}
//==================================================
function updateDataCell(unit, node, val, old) {
  //console.log('data:', node)
  let outDt = 0
  let flagDt = false
  let flagChar = false
  //-------------------------------
  if (node.data.type == 'Bool') {
    const dec = updateTypeBool(val, old)
    node.data.value = dec
    let digit = 0
    if (dec == 'yes') {
      digit = 1
    }
    outDt = digit
    flagDt = true
    //console.log('digit:', digit)
  } else if (node.data.type == 'Hex') {
    const digit = parseInt(val, 16)
    console.log('digit hex:', digit, old, val)
    if (isNaN(digit)) node.data.value = old
    else {
      outDt = digit
      flagDt = true
      //console.log('hex digit:', digit)
    }
  } else if (node.data.type == 'Int') {
    let dec = parseInt(val, 10)
    if (isNaN(dec)) {
      node.data.value = old
      console.log('dec:', dec)
      return
    }
    if (dec < 0) dec = 0xffffffff + dec + 1
    outDt = dec
    flagDt = true
    //console.log('dec:', dec)
  } else if (node.data.type == 'Uint') {
    const dec = parseInt(val, 10)
    if (isNaN(dec) || dec < 0) {
      node.data.value = old
      console.log('dec nan:', NaN)
      return
    } else {
      outDt = dec
      flagDt = true
      //console.log('dec:', dec)
    }
  } else if (node.data.type == 'Float') {
    const digit = updateTypeFloat(val)
    //console.log('float digit:', digit)
    if (isNaN(digit)) node.data.value = old
    else {
      outDt = digit
      flagDt = true
    }
  } else if (node.data.type == 'Char') {
    const hexdt = textToBytes(val)
    //console.log('Char digit:', hexdt)
    if (!hexdt.length) node.data.value = old
    else {
      outDt = hexdt
      flagDt = true
      flagChar = true
    }
  }
  //-------------------------------
  if (flagDt) {
    let dt
    const iUn = +unit
    const iPr = +node.data.id_par
    let lb = +node.data.leng
    if (flagChar) {
      dt = outDt
      lb = outDt.length
      //currDevice.unit[iUn].param[iPr].len = lb
    } else dt = getInt64Bytes(outDt)
    txDev = {
      id_dev: currDevice.ser,
      cmd: 5,
      id_unit: iUn,
      n_par: iPr,
      l_par: lb,
      data: dt,
    }
    //console.log('update txDev:', txDev)
    sbusPktSend(txDev)
  } else {
    // flagOpros = true
    // startOnesOpros()
    //stopOproc()
  }
}
//==================================================
function getInt64Bytes(long) {
  var byteArray = [0, 0, 0, 0, 0, 0, 0, 0]
  for (var index = 0; index < byteArray.length; index++) {
    var byte = long & 0xff
    byteArray[index] = byte
    long = (long - byte) / 256
  }
  return byteArray
}
//------------------------------------------------------
function intFromBytes(byteArr) {
  return byteArr.reduce((a, c, i) => a + c * 2 ** (56 - i * 8), 0)
}

//==================================================
// function openMyFile() {
//   var exec = require('child_process').exec
//   exec(
//     'E:\\Keil_projects\\Test_stend\\my_soft\\Sourse\\sbus.c',
//     function (err, stdout, stderr) {
//       if (err) {
//         throw err
//       }
//     }
//   )
// }
//==================================================
function loadCheckDevices(node) {
  const idNode = node.parent.replace('j1_', '')
  for (let m = 0; m < currDevice.uNum; m++) {
    const id = currDevice.unit[m].idUnit
    if (idNode == `${id}`) {
      //-----------------------------------
      const num = checkDevices.length
      const numParam = node.data.id_par
      const numNode = m
      //-----------------------------------------
      var nameUnit = []
      let nu = 0
      var parse = root_2P
      //console.log('parse: ', parse)
      let i = parse.length - 1
      for (i; i >= 0; i--) {
        if (parse[i].id == node.parents[nu]) {
          nameUnit[nu++] = parse[i].text
        }
      }
      // let com_ip = currDevice.ip
      // let bou_port = currDevice.port
      // if (flagCheckSel == 1) {
      //   com_ip = currDevice.com
      //   bou_port = currDevice.boud
      // } else if (flagCheckSel == 2) {
      //   com_ip = currDevice.ip
      //   bou_port = currDevice.port
      // }
      const checkUnit = {
        // ip: com_ip,
        // port: `${bou_port}`,
        //ser: `${currDevice.ser}`,
        idUnit: `${currDevice.unit[numNode].idUnit}`,
        name: nameUnit,
        param: {
          id: numParam,
          name: node.text,
          type: node.data.type,
          atrib: node.data.atrib,
          leng: node.data.len,
          value: node.data.value,
        },
      }
      checkDevices[num] = checkUnit
      console.log('checkDevices:', checkDevices)
      //-----------------------------------
      break
    }
  }
}
//==================================================
function deletUncheckNode(node) {
  const idParam = node.id
  //console.log('numNode, node:', numNode, node)
  for (let i = 0; i < checkDevices.length; i++) {
    const idU = checkDevices[i].idUnit
    const idP = checkDevices[i].param.id
    const idStr = 'j1_' + idU + idP
    if (idParam == idStr) {
      //console.log('idStr Exit:', idStr, i)
      checkDevices.splice(i, 1)
    }
  }
  console.log('checkDevices:', checkDevices)
}
//==================================================
let flagSelectStop = false
let flagSelectStart = false
let countOpenUnit = 0
let old_value = 0

$('div#treeDevice')
  .on('loaded_grid.jstree', function () {
    console.log('loaded_grid:')
  })
  .on('state_ready.jstree', function () {
    console.log('ready')
  })
  .on('change_state.jstree', function (e, d) {
    var node = d.args[0]
    console.log('change_state:', node)
  })
  .on('activate_node.jstree', function (e, data) {
    //console.log('activate_treeDevice: ')
    $('div#treeDevice').jstree(true).deselect_node(data.node)
    $('div#treeDevice').jstree(true).redraw_node(data.node)
  })
  .on('select_node.jstree', function (e, data) {
    //console.log('select_node 1: ', data.node.id)
    if (!selectCell) {
      const idNode = data.node.id.replace('j1_', '')
      if (idNode == data.node.data.id_par) openCloseNode(data.node)
    } else {
      if (nodeCellSelect) {
        nodeCellSelect.data.value = varOldCell
        $('div#treeDevice')
          .jstree(true)
          .trigger('change_node.jstree', nodeCellSelect)
        nodeCellSelect = undefined
        inputCell = false
      }
      //console.log('cellSelectUpdate:', data)
      let str = data.node.parent.replace('j1_', '')
      const unit = parseInt(str, 10)
      cellSelectUpdate(unit, data.node)
    }
  })
  .on('select_cell.jstree-grid', function (e, data) {
    //console.log('select_cell: ')
    // e.preventDefault()
    if (!selectCell) {
      selectCell = true
      setTimeout(() => {
        selectCell = false
      }, 500)
    }
  })
  // .on('render_cell.jstree-grid', function (e, data) {
  //   if (data.sourceName == 'value') {
  //     if (old_value == data.value) {
  //       console.log('render_cell', data)
  //     }
  //   }
  // })
  // .on('keydown.jstree', function (e, data) {
  //   console.log('keydown:', e, data)
  // })
  .on('update_cell.jstree-grid', function (e, data) {
    //console.log('update_cell', flagOpros)
    //stopOproc()
    let str = data.node.parent.replace('j1_', '')
    const unit = parseInt(str, 10)
    old_value = data.old
    updateDataCell(unit, data.node, data.value, data.old)
  })
  .on('rename_node.jstree', function (e, data) {
    console.log('rename_node: ')
  })
  .on('delete_node.jstree', function (e, data) {
    console.log('delete_node: ')
  })
  .on('open_node.jstree', function (e, data) {
    //console.log('currDevice:', currDevice)
    //console.log('open_node:', data.node.id)
    openNode.push(data.node.id)
    for (let i = 0; i < currDevice.uNum; i++) {
      let id = currDevice.unit[i].idUnit
      if (data.node.data.id_par == `${id}`) {
        currDevice.unit[i].opened = true
        //console.log('currDevice.unit[i].opened:', i)
      }
    }
    if (!flagOpen) {
      //stopOproc()
    }
    //console.log('flagOpros:', flagOpros)
    flagOpen = true
    let kk = 0
    for (let i = 0; i < currDevice.uNum; i++) {
      if (currDevice.unit[i].opened) kk++
    }
    countOpenUnit = kk
    //console.log('currDevice kk:', kk)
  })
  .on('close_node.jstree', function (e, data) {
    //console.log('close_node:', data)
    for (let i = 0; i < openNode.length; i++) {
      if (data.node.id == openNode[i]) {
        openNode.splice(i, 1)
      }
    }
    for (let i = 0; i < currDevice.uNum; i++) {
      let id = currDevice.unit[i].idUnit
      if (data.node.data.id_par == `${id}`) {
        currDevice.unit[i].opened = false
      }
    }
    if (!openNode.length) {
      //flagOpros = false
      flagOpen = false
      setTimeout(() => {
        clearInterval(timeOutTxPrt)
      }, 1000)
      console.log('close_node: No open nodes!')
      stopOproc()
    }
  })
  .on('check_node.jstree', function (e, data) {
    loadCheckDevices(data.node)
    //console.log('check_node:', data.node)
    //openMyFile()
  })
  .on('uncheck_node.jstree', function (e, data) {
    //console.log('uncheck_node:', data.node)
    deletUncheckNode(data.node)
  })
  .on('show_contextmenu.jstree', function (e, data) {
    //console.log('show_contextmenu: ')
    if (myTimerEvent > 0) {
      clearInterval(myTimerEvent)
      console.log('clearInterval_2')
    }
  })
  .on('click.jstree', function (e) {
    //console.log('click.jstree:')
  })
  .on('cellClick.jstree', function (row, col, e) {
    console.log('cellClick:')
  })
  .on('hover_node.jstree', function (e, n) {
    if (flagKnStart) {
      clearInterval(timeout_hover)
      clearInterval(timeout_dehover)
      timeout_hover = setTimeout(() => {
        clearInterval(timeout_dehover)
        stopOproc()
      }, 300)
    }
  })
  .on('dehover_node.jstree', function (e, n) {
    if (flagKnStart) {
      clearInterval(timeout_hover)
      clearInterval(timeout_dehover)
      timeout_dehover = setTimeout(() => {
        if (!flagCmd5) startOproc()
      }, 1000)
    }
  })
// .on('mouseup.jstree', function (e, n) {
//   console.log('mouseup:')
// })
//-----------------------
//let flag_editable = false
let timeout_hover = 0
let timeout_dehover = 0
//==========================================================================
function rowsTreeBgrColor(treeId) {
  //console.log('rowsTreeBgrColor: ', treeId)
  var tree = $(treeId).jstree(true)
  //var v = tree.get_json('#', { flat: true })
  //var parse = JSON.parse(JSON.stringify(v))
  var parse = root_2P
  //console.log('parse: ', parse)
  for (let i in parse) {
    if (parse[i].a_attr.class == 'bkgGrya1') parse[i].a_attr.class = ''
  }
  for (let i in parse) {
    if (i & 1) parse[i].a_attr.class = 'bkgGrya1'
  }
  tree.settings.core.data = parse
  tree.refresh(true, false)
}
//===================================================
function parseUnitTreeRoot(unit, k) {
  for (let i = 0; i < unit.nParam; i++) {
    const m = i
    const id = unit.idUnit + `${m}`
    const len = unit.param[i].len
    const pare = 'j1_' + unit.idUnit
    let atr = 'WR'
    let tcolor = 'txt_Write'
    let type = ''
    let style = 'color: #0d1df5; font-weight:bold; padding: 0px;'
    if ((unit.param[i].prop & 0xf0) == 0x10) {
      atr = 'R'
      tcolor = 'txt_Read'
      style = 'color: #000000; font-weight:bold; padding: 0px;'
    } else if ((unit.param[i].prop & 0xf0) == 0x90) {
      atr = 'CNTR'
      tcolor = 'txt_Cntr'
      style = 'color: #058d01; font-weight:bold; padding: 0px;'
    }
    switch (unit.param[i].prop & 0xf) {
      case 0:
        type = 'Char'
        break
      case 1:
        type = 'Int'
        break
      case 2:
        type = 'Uint'
        break
      case 3:
        type = 'Bool'
        break
      case 4:
        type = 'Float'
        break
      case 5:
        type = 'Hex'
        break
      case 6:
        type = 'Void'
        break
      case 7:
        type = 'Time'
        break
    }
    const unit_s = {
      id: 'j1_' + id,
      text: unit.param[i].name,
      icon: 'img/document.gif',
      li_attr: { id: 'j1_' + id },
      a_attr: {
        href: '#',
        id: 'j1_' + id + '_anchor',
        style: style,
      },
      state: {
        loaded: true,
        opened: true,
        selected: false,
        disabled: false,
        checked: false,
      },
      data: {
        id_par: `${i}`,
        type: type,
        atrib: atr,
        leng: `${len}`,
        textColor: tcolor,
        value: '',
      },
      parent: pare,
    }
    root_2P[k++] = unit_s
  }
  return k
}
//======================================== 1.Load configuration from file
$('a#loadConfTr').click(function () {
  console.log('loadFromFile:')
  ipcRend.send('open-file-dialog')
  return false
})
//-------------------------------------------------------
ipcRend.on('open-selected-file', function (event, path) {
  //console.log('open-path:', path[0])
  stopOproc()
  if (path[0]) {
    loadConfFromFile(path[0])
    setStorageData()
  }
})
//---------------------------------------------------- 2.
function loadConfFromFile(filePath) {
  var data = fs.readFileSync(filePath, { encoding: 'utf8', flag: 'r' })
  currDevice = JSON.parse(data)
  document.getElementById('serNum').value = numSerNum = currDevice.ser
  for (const i in currDevice.unit) currDevice.unit[i].opened = false
  //console.log('currDevice file:', currDevice)
  parseArrayTreeRoot(currDevice)
  rowsTreeBgrColor('div#treeDevice')
  //flagCheckSel = currDevice.check
  fileCurrent = filePath
  typeLabelInfo6(filePath)
  if (flagCheckSel == 2) {
    currDevice.ip = numIpAddr
    currDevice.port = numIpPort
    $('#loadInfo2')
      .prop(
        'innerHTML',
        'S/N: ' +
          currDevice.ser +
          ', IP: ' +
          currDevice.ip +
          ', Port: ' +
          currDevice.port
      )
      .css({ color: '#0004db' })
  } else if (flagCheckSel == 1) {
    let flag = false
    for (const i in comPorts) {
      //console.log('comPorts: ', comPorts, currFavor.device.com)
      if (comPorts[i] == numComPort) {
        flag = true
        break
      }
    }
    if (!flag) {
      typeLabelInfo5('Port ' + numComPort + ' missing!', '#e00000')
      return
    }
    currDevice.com = numComPort
    currDevice.boud = numBoudRate
    $('#loadInfo2')
      .prop(
        'innerHTML',
        'S/N: ' +
          currDevice.ser +
          ', ' +
          currDevice.com +
          ', Boud rate: ' +
          currDevice.boud
      )
      .css({ color: '#0004db' })
  } else {
    console.log('File download error!')
    return
  }
  openNode = []
}
//----------------------------------------------------

//=============================================== Save configuration to file
function saveTreeDevice(filePath) {
  //var v = $('div#treeDevice').jstree(true).get_json('#', { flat: true })
  currDevice.load = 'file'
  var mytext = JSON.stringify(currDevice)
  //console.log('mytext:', mytext)
  const dataStr = jsonSaveToFile(mytext, filePath)
  return dataStr
}
//-----------------------------------------------------
$('a#saveToFile').click(function () {
  console.log('saveToFile:')
  ipcRend.send('save-file-dialog')
  return false
})
//-------------------------------------------------------
ipcRend.on('save-selected-file', function (event, path) {
  //console.log('save-path:', path[0])
  if (path[0]) {
    const dataStr = saveTreeDevice(path[0])
    //console.log('dataStr:', dataStr)
  }
})
//==========================================================================
function existFilePath(filePath) {
  return fs.existsSync(filePath)
}
//--------------------------------------------------- json Save To File
function jsonSaveToFile(data, filePath) {
  //console.log('filePath: ' + filePath)
  fs.writeFileSync(filePath, data)
  const dt = fs.statSync(filePath)
  //console.log('dt: ', dt.mtime)
  const str = `${dt.mtime}`
  const dataStr = str.substr(4, 21)
  return dataStr
}
//================================================== Load selection of options
$('a#addToFavor').click(function () {
  console.log('addToFavor:', currFavor.favor.length)
  if (currDevice.unit.length) ipcRend.send('open-favor-dialog')
  else console.log('Tree not loaded!')
  return false
})
//-------------------------------------------------------
ipcRend.on('open-selected-favor', function (event, path) {
  //console.log('save-path:', path[0])
  if (path[0]) {
    const data = fs.readFileSync(path[0], { encoding: 'utf8', flag: 'r' })
    currFavor = JSON.parse(data)
    console.log('currFavor:', currFavor)
    if (currFavor.favor.length) {
      clearCheckToCurrDev()
      selectCheckToCurrDev(currFavor)
    } else {
      console.log('No nodes selected!')
    }
  }
})
//--------------------------------------------------------
function clearCheckToCurrDev() {
  let k = 0
  var parse = root_2P
  for (let k in parse) {
    const id = parse[k].id
    $('div#treeDevice').jstree('uncheck_node', id)
  }
}
// function clearCheckToCurrDev(data) {
//   let k = 0
//   var parse = root_2P
//   for (let i = 0; i < data.favor.length; i++) {
//     for (let k in parse) {
//       const idNode = parse[k].parent.replace('j1_', '')
//       if (
//         data.favor[i].idUnit == idNode &&
//         data.favor[i].param.id == parse[k].data.id_par
//       ) {
//         const id = parse[k].id
//         $('div#treeDevice').jstree('uncheck_node', id)
//         //console.log('node: ', id, parse[k].data.id_par)
//         break
//       }
//     }
//   }
// }
//--------------------------------------------------------
function selectCheckToCurrDev(data) {
  var newData = []
  let k = 0
  for (let i = 0; i < data.favor.length; i++) {
    newData[k++] = data.favor[i]
  }
  //console.log('newData: ', newData)
  var parse = root_2P
  //console.log('parse: ', parse)
  if (newData.length == 0) return 0
  for (let i = 0; i < newData.length; i++) {
    for (let k in parse) {
      const idNode = parse[k].parent.replace('j1_', '')
      if (
        newData[i].idUnit == idNode &&
        newData[i].param.id == parse[k].data.id_par
      ) {
        const id = parse[k].id
        $('div#treeDevice').jstree('check_node', id)
        //console.log('node: ', id, parse[k].data.id_par)
        break
      }
    }
  }
  return newData.length
}
//============================================== Save selected settings
function saveFavorDevice(filePath, data) {
  let devPar = []
  devPar = {
    ser: `${currDevice.ser}`,
  }
  const dataSave = {
    device: devPar,
    favor: data,
  }
  //console.log('dataSave:', dataSave)
  currFavor = dataSave
  var mytext = JSON.stringify(dataSave)
  //console.log('mytext:', mytext)
  const dataStr = jsonSaveToFile(mytext, filePath)
  return dataStr
}
//===================================================
$('a#saveFavor').click(function () {
  console.log('saveFavor, currDevice.unit.length:', currDevice.unit.length)
  if (!currDevice.unit.length) {
    console.log('Tree not loaded!')
    return false
  }
  if (checkDevices.length) {
    ipcRend.send('save-favor-dialog')
  } else {
    console.log('No nodes selected!', checkDevices.length)
  }
  return false
})
//-------------------------------------------------------
ipcRend.on('save-selected-favor', function (event, path) {
  //console.log('save-path:', path[0])
  if (path[0]) {
    const dataStr2 = saveFavorDevice(path[0], checkDevices)
    console.log('dataStr2:', dataStr2)
    //console.log('checkDevices:', checkDevices)
    //}
  }
})
//=========================================================
function typeLabelInfo5(info, color) {
  $('#loadInfo5')
    .prop('innerHTML', info)
    .css({ color: color, 'font-weight': 'bold' })
}
//------------------------------------------------------------------
function typeLabelInfo6(info) {
  $('#loadInfo1').prop('innerHTML', 'Loaded configuration from file: ')
  $('#loadInfo11').prop('innerHTML', info)
}
//==========================================================================
