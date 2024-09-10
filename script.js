const form = document.getElementById('uploadForm');
const imageInput = document.getElementById('imageInput');
const imagePreview = document.getElementById('imagePreview');
const loading = document.getElementById('loading');
const result = document.getElementById('result');

// API 端點
const API_ENDPOINT = 'http://54.254.194.136:183//dog-predict';

imageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            imagePreview.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
});

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const file = imageInput.files[0];
    if (!file) return;

    loading.style.display = 'block';
    result.textContent = '';

    try {
        const imageUrl = await uploadImageToGist(file);
        const prediction = await getPrediction(imageUrl);
        displayResult(prediction);
    } catch (error) {
        result.textContent = '發生錯誤：' + error.message;
    } finally {
        loading.style.display = 'none';
    }
});

async function uploadImageToGist(file) {
    const base64 = await toBase64(file);
    const gistData = {
        description: "Uploaded image for pet breed identification",
        public: true,
        files: {
            "image.txt": {
                content: base64
            }
        }
    };

    const response = await axios.post('https://api.github.com/gists', gistData, {
        headers: {
            'Authorization': 'token YOUR_GITHUB_PERSONAL_ACCESS_TOKEN'
        }
    });

    return response.data.files['image.txt'].raw_url;
}

function toBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = error => reject(error);
    });
}

async function getPrediction(imageUrl) {
    const response = await axios.post(API_ENDPOINT, { url: imageUrl });
    return response.data;
}

function displayResult(prediction) {
    result.innerHTML = '識別結果：<br>' + 
        Object.entries(prediction)
            .map(([breed, probability]) => `${breed}: ${probability}`)
            .join('<br>');
}
