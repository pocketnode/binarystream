declare global {
    interface ArrayBuffer {
        transfer(size: number): ArrayBuffer;
    }
}

if (!ArrayBuffer.prototype.transfer) {
    ArrayBuffer.prototype.transfer = function (size: number): ArrayBuffer {
        const buffer = new ArrayBuffer(size);
        const view = new Uint8Array(buffer);
        view.set(new Uint8Array(this, 0, size));
        return buffer;
    };
}