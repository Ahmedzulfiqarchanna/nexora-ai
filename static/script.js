document.addEventListener("DOMContentLoaded", function () {

    console.log("NEXORA AI v2.0 loaded successfully.");

    const chatInput = document.getElementById("messageInput");
    const sendBtn = document.getElementById("sendBtn");
    const chatBox = document.getElementById("chatBox");
    const newChatBtn = document.getElementById("newChatBtn");
    const historyList = document.getElementById("historyList");

    const themeBtn = document.getElementById("themeBtn");
    const clearBtn = document.getElementById("clearBtn");
    const helpBtn = document.getElementById("helpBtn");

    const helpModal = document.getElementById("helpModal");
    const closeHelp = document.getElementById("closeHelp");

    const menuBtn = document.getElementById("menuBtn");
    const sidebar = document.getElementById("sidebar");


    /* =========================
       CHAT STORAGE
    ========================= */

    let chats = JSON.parse(
        localStorage.getItem("nexoraChats") || "[]"
    );

    function saveChats() {
        localStorage.setItem(
            "nexoraChats",
            JSON.stringify(chats)
        );
    }


    /* =========================
       ADD MESSAGE
    ========================= */

    function addMessage(text, type) {

        const message = document.createElement("div");

        message.className = "message " + type;

        const avatar = document.createElement("div");

        avatar.className = "avatar";

        avatar.textContent =
            type === "user" ? "U" : "N";


        const content = document.createElement("div");

        content.className = "message-content";

        content.textContent = text;


        message.appendChild(avatar);
        message.appendChild(content);

        chatBox.appendChild(message);

        chatBox.scrollTop = chatBox.scrollHeight;
    }


    /* =========================
       HISTORY
    ========================= */

    function addHistory(text) {

        if (!historyList) return;

        const historyItem =
            document.createElement("div");

        historyItem.className = "history-item";

        historyItem.textContent =
            text.length > 35
                ? text.substring(0, 35) + "..."
                : text;

        historyItem.addEventListener(
            "click",
            function () {

                chatInput.value = text;

                chatInput.focus();

            }
        );

        historyList.prepend(historyItem);
    }


    function loadHistory() {

        historyList.innerHTML = "";

        chats.forEach(function (chat) {

            addHistory(chat);

        });

    }


    /* =========================
       TYPING
    ========================= */

    function showTyping() {

        const typing =
            document.createElement("div");

        typing.id = "typingMessage";

        typing.className = "message ai";

        typing.innerHTML = `
            <div class="avatar">N</div>

            <div class="message-content">

                <div class="typing">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>

            </div>
        `;

        chatBox.appendChild(typing);

        chatBox.scrollTop =
            chatBox.scrollHeight;
    }


    function removeTyping() {

        const typing =
            document.getElementById(
                "typingMessage"
            );

        if (typing) {
            typing.remove();
        }
    }


    /* =========================
       SEND MESSAGE
    ========================= */

    async function sendMessage() {

        const message =
            chatInput.value.trim();

        if (!message) return;


        const welcome =
            document.getElementById("welcome");

        if (welcome) {
            welcome.remove();
        }


        addMessage(message, "user");


        chats.push(message);

        saveChats();

        addHistory(message);


        chatInput.value = "";

        chatInput.style.height = "auto";


        sendBtn.disabled = true;

        showTyping();


        try {

            const response =
                await fetch("/chat", {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        message: message
                    })

                });


            const data =
                await response.json();


            removeTyping();


            if (response.ok) {

                addMessage(
                    data.reply ||
                    "NEXORA AI could not generate a response.",
                    "ai"
                );

            } else {

                addMessage(
                    data.error ||
                    "Something went wrong.",
                    "ai"
                );

            }

        } catch (error) {

            console.error(
                "NEXORA ERROR:",
                error
            );

            removeTyping();

            addMessage(
                "NEXORA AI server se connect nahi ho raha. Please check app.py.",
                "ai"
            );

        }


        sendBtn.disabled = false;

        chatInput.focus();
    }


    /* =========================
       SEND BUTTON
    ========================= */

    sendBtn.addEventListener(
        "click",
        sendMessage
    );


    /* =========================
       ENTER
    ========================= */

    chatInput.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key === "Enter" &&
                !event.shiftKey
            ) {

                event.preventDefault();

                sendMessage();
            }

        }
    );


    /* =========================
       SUGGESTIONS
    ========================= */

    window.useSuggestion =
        function (text) {

            chatInput.value = text;

            chatInput.focus();

            chatInput.dispatchEvent(
                new Event("input")
            );
        };


    /* =========================
       NEW CHAT
    ========================= */

    newChatBtn.addEventListener(
        "click",
        function () {

            chatBox.innerHTML = `
                <div id="welcome" class="welcome">

                    <div class="hero-logo">
                        N
                    </div>

                    <h1>
                        How can I help you?
                    </h1>

                    <p>
                        I'm <strong>NEXORA AI</strong>,
                        your intelligent digital assistant.
                    </p>

                    <div class="suggestions">

                        <button onclick="useSuggestion('Explain Python in simple words')">
                            <span class="suggestion-icon">🐍</span>
                            <div>
                                <b>Learn Python</b>
                                <small>Explain programming concepts</small>
                            </div>
                        </button>

                        <button onclick="useSuggestion('Help me create a professional website')">
                            <span class="suggestion-icon">💻</span>
                            <div>
                                <b>Build a Website</b>
                                <small>Get coding assistance</small>
                            </div>
                        </button>

                        <button onclick="useSuggestion('Explain artificial intelligence in simple words')">
                            <span class="suggestion-icon">🧠</span>
                            <div>
                                <b>Learn AI</b>
                                <small>Understand technology</small>
                            </div>
                        </button>

                        <button onclick="useSuggestion('Help me solve a difficult problem step by step')">
                            <span class="suggestion-icon">💡</span>
                            <div>
                                <b>Solve Problems</b>
                                <small>Get step-by-step help</small>
                            </div>
                        </button>

                    </div>

                </div>
            `;

            chatInput.value = "";

            chatInput.focus();

        }
    );


    /* =========================
       CLEAR CHATS
    ========================= */

    clearBtn.addEventListener(
        "click",
        function () {

            if (
                confirm(
                    "Clear all NEXORA chat history?"
                )
            ) {

                chats = [];

                saveChats();

                historyList.innerHTML = "";

            }

        }
    );


    /* =========================
       DARK / LIGHT
    ========================= */

    if (
        localStorage.getItem("nexoraTheme")
        === "dark"
    ) {

        document.body.classList.add("dark");

    }


    themeBtn.addEventListener(
        "click",
        function () {

            document.body.classList.toggle("dark");

            localStorage.setItem(
                "nexoraTheme",
                document.body.classList.contains("dark")
                    ? "dark"
                    : "light"
            );

        }
    );


    /* =========================
       HELP
    ========================= */

    helpBtn.addEventListener(
        "click",
        function () {

            helpModal.classList.add("show");

        }
    );


    closeHelp.addEventListener(
        "click",
        function () {

            helpModal.classList.remove("show");

        }
    );


    helpModal.addEventListener(
        "click",
        function (event) {

            if (
                event.target === helpModal
            ) {

                helpModal.classList.remove(
                    "show"
                );

            }

        }
    );


    /* =========================
       MOBILE MENU
    ========================= */

    menuBtn.addEventListener(
        "click",
        function () {

            sidebar.classList.toggle("open");

        }
    );


    /* =========================
       AUTO RESIZE
    ========================= */

    chatInput.addEventListener(
        "input",
        function () {

            this.style.height = "auto";

            this.style.height =
                Math.min(
                    this.scrollHeight,
                    150
                ) + "px";

        }
    );


    /* =========================
       LOAD HISTORY
    ========================= */

    loadHistory();

});