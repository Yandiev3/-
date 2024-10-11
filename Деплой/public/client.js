document.getElementById('search').addEventListener('click', async () => {
    const keyword = document.getElementById('keyword').value;
    const urlsDiv = document.getElementById('urls');
    const progressDiv = document.getElementById('progress');
    const contentListDiv = document.getElementById('content-list');
    const contentDiv = document.getElementById('content');

    urlsDiv.innerHTML = '';
    progressDiv.innerHTML = '';
    contentDiv.innerHTML = '';

    try {
        const response = await fetch(`/keywords?keyword=${keyword}`);
        const urls = await response.json();

        urls.forEach((url, index) => {
            const button = document.createElement('button');
            button.textContent = url;
            button.addEventListener('click', async () => {
                progressDiv.innerHTML = 'Downloading...';
                const downloadResponse = await fetch(`/download?url=${encodeURIComponent(url)}`);
                const reader = downloadResponse.body.getReader();
                const content = [];
                let total = 0;
                let loaded = 0;

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    content.push(value);
                    loaded += value.length;
                    progressDiv.innerHTML = `Downloaded ${loaded} of ${total} bytes`;
                }

                const blob = new Blob(content);
                const contentUrl = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = contentUrl;
                link.download = `content-${index}.html`;
                link.textContent = `Downloaded content-${index}.html`;
                contentListDiv.appendChild(link);

                localStorage.setItem(`content-${index}`, JSON.stringify({ url, content: blob }));
            });
            urlsDiv.appendChild(button);
        });
    } catch (error) {
        alert('Error fetching URLs');
    }
});

document.getElementById('content-list').addEventListener('click', (event) => {
    if (event.target.tagName === 'A') {
        const contentIndex = event.target.download.split('-')[1].split('.')[0];
        const contentData = JSON.parse(localStorage.getItem(`content-${contentIndex}`));
        const contentBlob = new Blob([new Uint8Array(contentData.content.data)]);
        const contentUrl = URL.createObjectURL(contentBlob);
        document.getElementById('content').innerHTML = `<iframe src="${contentUrl}" style="width:100%; height:500px;"></iframe>`;
    }
});