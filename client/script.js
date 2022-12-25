import bot from "./assets/bot.svg";
import user from "./assets/user.svg";

const form = document.querySelector("form");
const chatContainer = document.querySelector("#chat_container");

let loadInterval;

/**
 * It takes an element as an argument and adds a dot to the element's text content every 300
 * milliseconds. If the element's text content is equal to "....", it resets the text content to an
 * empty string
 * @param element - The element that will be used to display the loader.
 */
function loader(element) {
  element.textContent = "";

  loadInterval = setInterval(() => {
    element.textContent += ".";

    if (element.textContent === "....") {
      element.textContext = "";
    }
  }, 300);
}

function typeText(element, text) {
    let index = 0

    let interval = setInterval(() => {
        if (index < text.length) {
            element.innerHTML += text.charAt(index)
            index++
        } else {
            clearInterval(interval)
        }
    }, 20)
}

/**
 * It generates a unique id by combining a timestamp and a random number.
 * @returns A string that is a concatenation of the string "id-", the current timestamp, and a random
 * hexadecimal number.
 */
function generateUniqueId() {
    const timestamp = Date.now();
    const randomNumber = Math.random()
    const hexadecimalString = randomNumber.toString(16)

    return `id-${timestamp}-${hexadecimalString}`;
}

function chatStripe (isAi, value, uniqueId) {
    return (
        `
            <div class="wrapper ${isAi && 'ai'}">
                <div class="chat">
                    <div className="profile">
                        <img
                            src="${isAi ? bot : user}"
                            alt="${isAi ? "bot" : "user"}"
                        />
                    </div>
                    <div class="message" id=${uniqueId}>
                        ${value}
                    </div>
                </div>
            </div>
        `
    )
}

const handleSubmit = async (e) => {
    e.preventDefault()

    const data = new FormData(form);

    chatContainer.innerHTML += chatStripe(false, data.get('prompt'))

    form.reset();

    const uniqueId = generateUniqueId()
    chatContainer.innerHTML += chatStripe(true, " ", uniqueId)

    chatContainer.scrollTop = chatContainer.scrollHeight

    const messageDiv = document.getElementById(uniqueId)

    loader(messageDiv)

    const response = await fetch('https://codex-im0y.onrender.com/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            prompt: data.get('prompt')
        })
    })

    clearInterval(loadInterval)
    messageDiv.innerHTML = " "

    if (response.ok) {
        const data = await response.json()
        const parseData = data.bot.trim()

        typeText(messageDiv, parseData)
    } else {
        const err = await response.text()

        messageDiv.innerHTML = "Something went wrong"
        alert(err)
    }
}

form.addEventListener('submit', handleSubmit);

form.addEventListener('keyup', (e) => {
    if (e.keyCode === 13) {
        handleSubmit(e)
    }
})