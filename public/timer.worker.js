self.onmessage = function() {
    setInterval(() => {
        self.postMessage('tick');
    }, 1000);
};
