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

    // ⚠️ 不建议写在前端（后面我会教你改后端）
    const apiKey = 'sk-V9IwuhDXqDhR3hXtSrFYq1g8nO53QeLqLqXrWJ1rP2ufF7MT';


    // ====== 图片转 base64 ======
    let imageBase64 = null;

    if (pastedImage) {
        const reader = new FileReader();

        imageBase64 = await new Promise(resolve => {
            reader.onload = () => resolve(reader.result);
            reader.readAsDataURL(pastedImage);
        });
    }


    // ====== 构造请求 ======
    const payload = {
        model: "gpt-5.3-codex",
        input: [
            {
                role: "user",
                content: [
                    ...(text ? [{
                        type: "input_text",
                        text: text
                    }] : []),

                    ...(imageBase64 ? [{
                        type: "input_image",
                        image_url: imageBase64
                    }] : [])
                ]
            }
        ]
    };


    try {
        const res = await fetch("https://anyrouter.top/v1/responses", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        const data = await res.json();

        // ✅ 正确解析返回
        const reply =
            data.output?.[0]?.content?.[0]?.text ||
            data.output_text ||
            "出错了";

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
