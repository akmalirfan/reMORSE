let controllers = {};
let prevBtn = '~'; // Might have to use array so that more controllers can be supported
let codeStr = ''
let rAF = window.requestAnimationFrame;
let morse = {
    '.-'   : 'a',
    '-...' : 'b',
    '-.-.' : 'c',
    '-..'  : 'd',
    '.'    : 'e',
    '..-.' : 'f',
    '--.'  : 'g',
    '....' : 'h',
    '..'   : 'i',
    '.---' : 'j',
    '-.-'  : 'k',
    '.-..' : 'l',
    '--'   : 'm',
    '-.'   : 'n',
    '---'  : 'o',
    '.--.' : 'p',
    '--.-' : 'q',
    '.-.'  : 'r',
    '...'  : 's',
    '-'    : 't',
    '..-'  : 'u',
    '...-' : 'v',
    '.--'  : 'w',
    '-..-' : 'x',
    '-.--' : 'y',
    '--..' : 'z',
    '.----': '1',
    '..---': '2',
    '...--': '3',
    '....-': '4',
    '.....': '5',
    '-....': '6',
    '--...': '7',
    '---..': '8',
    '----.': '9',
    '-----': '0'
}

const createKeyboard = () => {
    let keys = [
        'qwertyuiop',
        'asdfghjkl',
        'zxcvbnm'
    ]

    for (let [index, key] of keys.entries()) {
        let div = document.createElement('div')
        for (let i = 0; i < key.length; i++) {
            let btn = document.createElement('button')
            btn.appendChild(document.createTextNode(key.charAt(i)))
            btn.setAttribute('id', `key${key.charAt(i).toUpperCase()}`)

            if (i === 0) {
                btn.setAttribute('style', `margin-left: ${index * 10}px;`)
            }
            div.appendChild(btn)
        }
        keyboard.appendChild(div)
    }

    // Update it for the first time
    updateKeyboard('')
}

const updateKeyboard = codeStr => {
    let matchedCodes = Object.keys(morse).filter(code => {
        let matches = code.match(new RegExp(`^${codeStr.replace('.', '[.]')}[.-]*`))
        if (matches) return Boolean(matches[0].length)
        return false
    })
    let nextDit = matchedCodes.filter(code => code[codeStr.length] === '.').map(code => morse[code])
    let nextDah = matchedCodes.filter(code => code[codeStr.length] === '-').map(code => morse[code])
    let exactMatch = matchedCodes.filter(code => code === codeStr).map(code => morse[code])

    // Make all the letters transparent
    for (let btn of document.getElementsByTagName('button')) {
        btn.style.color = 'transparent'
    }

    // Add indicator for matched keys (nextDit)
    for (let key of nextDit) {
        let btn = document.getElementById(`key${key.toUpperCase()}`)

        if (btn) {
            btn.style.color = 'black'
            btn.innerText = `${key}\u0323`
        }
    }

    // Add indicator for matched keys (nextDah)
    for (let key of nextDah) {
        let btn = document.getElementById(`key${key.toUpperCase()}`)

        if (btn) {
            btn.style.color = 'black'
            btn.innerText = `${key}\u0320`
        }
    }

    // Add indicator for matched key (exactMatch)
    for (let key of exactMatch) {
        let btn = document.getElementById(`key${key.toUpperCase()}`)

        if (btn) {
            btn.style.color = 'red'
            btn.innerText = key
        }
    }
}

function updateStatus() {
    scangamepads();
    let textbox = document.getElementById('textbox')
    for (j in controllers) {
        let controller = controllers[j];
        for (let i=0; i<controller.buttons.length; i++) {
            let val = controller.buttons[i];
            let pressed = val == 1.0;
            let touched = false;
            if (typeof(val) == "object") {
                pressed = val.pressed;
                if ('touched' in val) {
                    touched = val.touched;
                }
                val = val.value;
            }
            if (touched) {
                if (prevBtn === '~') {
                    if (i === 1) { // A
                        if (morse[codeStr] !== undefined) {
                            textbox.value += morse[codeStr]
                        }
                        console.log(codeStr)
                        if (codeStr === '') textbox.value += ' '
                        codeStr = ''
                    } else if (i === 2) { // B
                        textbox.value = textbox.value.slice(0, -1)
                        codeStr = ''
                    } else if (i === 4) { // L
                        codeStr += '.'
                    } else if (i === 5) { // R
                        codeStr += '-'
                    }
                    prevBtn += i
                } else {
                // This algorithm was made with the assumption that
                // humans cannot alternate between two buttons quickly
                if (i === 4) {
                    if (prevBtn === '55') codeStr += '.'
                } else if (i === 5) {
                    if (prevBtn === '44') codeStr += '-'
                }
                prevBtn += i
                prevBtn = prevBtn.slice(-2)

                updateKeyboard(codeStr)
                }
            } else {
                if (prevBtn.endsWith(`${i}`)) {
                    prevBtn = '~'
                }
            }
        }

        for (let i=0; i<controller.axes.length; i++) {
            // textbox.selectionStart
            // textbox.setSelectionRange(start, end)
            if(Math.abs(controller.axes[i]) >= 1) console.log(controller.axes)
        }
    }
    rAF(updateStatus);
}

function scangamepads() {
    let gamepads = navigator.getGamepads()
    for (let i = 0; i < gamepads.length; i++) {
        if (gamepads[i] && (gamepads[i].index in controllers)) {
            controllers[gamepads[i].index] = gamepads[i];
        }
    }
}

if ('GamepadEvent' in window) {
    window.addEventListener("gamepadconnected", e => {
        controllers[e.gamepad.index] = e.gamepad;
        rAF(updateStatus);
    });
    window.addEventListener("gamepaddisconnected", e => {
        delete controllers[e.gamepad.index];
    });
} else {
    setInterval(scangamepads, 500);
}
