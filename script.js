// ================== 全局变量 ==================
let pastedImage = null;


// ================== 粘贴图片 ==================
document.getElementById('chat-input').addEventListener('paste', function (e) {
    const items = e.clipboardData.items;

    for (let item of items) {
        if (item.type.startsWith('image')) {
            pastedImage = item.getAsFile();

            displayMessage('bot', '📷 图片已粘贴，点击发送即可');
        }
    }
});


// ================== 格式化消息 ==================
function formatMessage(text) {
    if (!text) return '';

    return text
        .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
        .replace(/\n/g, '<br>');
}


// ================== 显示消息 ==================
function displayMessage(role, message) {
    const container = document.getElementById('messages');

    const div = document.createElement('div');
    div.className = `message ${role}`;

    const content = document.createElement('div');
    content.className = 'message-content';

    content.innerHTML = role === 'user'
        ? message
        : formatMessage(message);

    div.appendChild(content);
    container.appendChild(div);

    div.scrollIntoView({ behavior: 'smooth' });
}


// ================== 发送消息 ==================
async function sendMessage() {

    const input = document.getElementById('chat-input');
    const text = input.value.trim();

    if (!text && !pastedImage) return;

    displayMessage('user', text || '📷 图片');

    input.value = '';

    // 👇👇👇 在这里粘贴你的 API KEY 👇👇👇
    const apiKey = 'sk-HrA7kqEtJ5SmF8KAguxyHS2XsxD0KYLte8azHkRV0cfEnCgw';


    // ====== 图片转 base64 ======
    let imageBase64 = null;

    if (pastedImage) {
        const reader = new FileReader();

        imageBase64 = await new Promise(resolve => {
            reader.onload = () => resolve(reader.result.split(',')[1]);
            reader.readAsDataURL(pastedImage);
        });
    }


    // ====== 构造 GPT 请求 ======
    const payload = {
        model: "gpt-5.3-codex",
        messages: [
            {
                role: "user",
                content: [
                    { type: "text", text: text || "请分析这张图片" },
                    ...(imageBase64 ? [{
                        type: "image",
                        data: imageBase64
                    }] : [])
                ]
            }
        ]
    };


    try {
        const res = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        const data = await res.json();

        const reply = data.choices?.[0]?.message?.content || "出错了";

        displayMessage('bot', reply);

    } catch (err) {
        displayMessage('bot', '请求失败');
        console.error(err);
    }

    pastedImage = null;
}


// ================== 回车发送 ==================
document.getElementById('chat-input').addEventListener('keypress', function (e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});