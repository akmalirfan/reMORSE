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
                    if (i === 1) {
                        if (morse[codeStr] !== undefined) {
                            textbox.value += morse[codeStr]
                        }
                        console.log(codeStr)
                        if (codeStr === '') textbox.value += ' '
                        codeStr = ''
                    }
                    if (i === 2) { // B
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
