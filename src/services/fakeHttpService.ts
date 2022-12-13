
const http = {
    getFile: () => {
        const req = new Request('./images/turtle.png');

        return new Promise<string | ArrayBuffer | null>((resolve) => {
            fetch(req).then(r => {
                r.blob().then(r => {
                    const fr = new FileReader();
                    fr.onloadend = () => { resolve(fr.result); };
                    fr.readAsDataURL(r);
                });
            });
        });
    }
}

export default http;