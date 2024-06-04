interface InternetAddress {
    address: string;
    port: number;
    version: number;
}

declare global {
    interface ArrayBuffer {
        transfer(size: number): ArrayBuffer;
    }
}

/**
 * BinaryStream
 */
export default class BinaryStream {
    protected view: DataView;
    public offset: number = 0;

    constructor(buffer: number[] | Uint8Array, offset?: number);
    constructor(buffer: ArrayBuffer, offset?: number);
    constructor(size: number);
    constructor(
        buffer?: any,
        offset: number = 0
    ) {
        if (typeof buffer === "number") {
            buffer = new ArrayBuffer(buffer);
        } else {
            buffer = buffer ?? new ArrayBuffer(0);
        }
        if (buffer instanceof ArrayBuffer) {
            this.view = new DataView(buffer);
        } else {
            this.view = new DataView(new ArrayBuffer(0));
            this.write(buffer);
        }

        this.offset = offset;
    }

    getDataView(): DataView {
        return this.view;
    }

    resize(size: number, canShrink: boolean = true): this {
        if (canShrink || (!canShrink && size > this.view.buffer.byteLength)) {
            this.view = new DataView(this.view.buffer.transfer(size));
        }
        return this;
    }

    equals(stream: BinaryStream | Uint8Array): boolean {
        if (this.length !== stream.length) return false;
        let self = this.buffer;
        let other = stream instanceof BinaryStream ? stream.buffer : stream;
        for (let i = 0; i < self.byteLength; i++) {
            if (self[i] !== other[i]) return false;
        }
        return true;
    }

    increaseOffset(length: number, offset?: number) {
        if (offset !== undefined) {
            this.offset = offset;
        }

        return {
            start: this.offset,
            end: this.offset += length
        };
    }

    /**
     * Read a set of bytes from the buffer
     */
    read(length: number, offset?: number): Uint8Array {
        const { start, end } = this.increaseOffset(length, offset);
        if (start > this.length) {
            throw new RangeError(`Buffer overrun, cannot read past the end of the buffer. Start: ${start}, End: ${end}, Length: ${this.length}`);
        }

        return new Uint8Array(this.view.buffer.slice(start, end));
    }

    /**
     * Write data to stream's buffer
     */
    write(buffer: Uint8Array | number[], offset?: number): this {
        const { start, end } = this.increaseOffset(buffer.length, offset);
        if (end > this.length) {
            this.resize(end, false);
        }

        for (let i = 0; i < buffer.length; i++) {
            this.view
                .setUint8(start + i, buffer[i]);
        }

        return this;
    }

    /**
     * Reset the stream's buffer
     */
    reset(): this {
        return this.resize(0).flip();
    }

    /**
     * Set the buffer and/or offset
     */
    setBuffer(buffer: Uint8Array | number[], offset: number = 0): this {
        this.reset().write(buffer);
        this.offset = offset;
        return this;
    }

    /**
     * Get stream's buffer
     */
    get buffer(): Uint8Array {
        return new Uint8Array(this.view.buffer);
    }

    /**
     * Get the size of the buffer
     */
    get length(): number {
        return this.view.buffer.byteLength;
    }

    /**
     * Create a Blob from the buffer
     */
    blob(type: string = "application/octet-stream"): Blob {
        return new Blob([this.view.buffer], { type });
    }

    /**
     * Get the amount of remaining bytes that can be read
     */
    getRemainingBytes(): number {
        return this.length - this.offset;
    }

    /**
     * Read the remaining amount of bytes
     */
    readRemainingBytes(): Uint8Array {
        return this.read(this.getRemainingBytes());
    }

    /**
     * Reads a boolean
     */
    readBool(offset?: number): boolean {
        return this.readByte(offset) !== 0;
    }
    readBoolean = this.readBool;

    /**
     * Writes a boolean
     */
    writeBool(v: boolean, offset?: number): this {
        return this.writeByte(Number(v), offset);
    }
    writeBoolean = this.writeBool;

    /**
     * Reads an unsigned 8-bit number
     */
    readUInt8(offset?: number): number {
        return this.view.getUint8(this.increaseOffset(1, offset).start);
    }

    /**
     * Reads a unsigned/signed byte
     */
    readByte = this.readUInt8;

    /**
     * Writes an unsigned 8-bit number
     */
    writeUInt8(v: number, offset?: number): this {
        const { start, end } = this.increaseOffset(1, offset);

        this.resize(end, false)
            .view
            .setUint8(start, v);

        return this;
    }

    /**
     * Reads a signed 8-bit number
     */
    readInt8(offset?: number): number {
        return this.view.getInt8(this.increaseOffset(1, offset).start);
    }

    /**
     * Writes a signed 8-bit number
     */
    writeInt8(v: number, offset?: number): this {
        const { start, end } = this.increaseOffset(1, offset);

        this.resize(end, false)
            .view
            .setInt8(start, v);

        return this;
    }

    /**
     * Writes a unsigned/signed byte
     */
    writeByte = this.writeUInt8;

    /**
     * Reads a 16-bit unsigned big-endian number
     */
    readUInt16BE(offset?: number): number {
        return this.view.getUint16(this.increaseOffset(2, offset).start);
    }
    readUInt16 = this.readUInt16BE;
    readUShortBE = this.readUInt16BE;
    readUShort = this.readUInt16BE;

    /**
     * Writes a 16-bit unsigned big-endian number
     */
    writeUInt16BE(v: number, offset?: number): this {
        const { start, end } = this.increaseOffset(2, offset);

        this.resize(end, false)
            .view
            .setUint16(start, v);

        return this;
    }
    writeUInt16 = this.writeUInt16BE;
    writeUShortBE = this.writeUInt16BE;
    writeUShort = this.writeUInt16BE;

    /**
     * Reads a 16-bit signed big-endian number
     */
    readInt16BE(offset?: number): number {
        return this.view.getInt16(this.increaseOffset(2, offset).start);
    }
    readInt16 = this.readInt16BE;
    readShortBE = this.readInt16BE;
    readShort = this.readInt16BE;

    /**
     * Writes a 16-bit signed big-endian number
     */
    writeInt16BE(v: number, offset?: number): this {

        const { start, end } = this.increaseOffset(2, offset);

        this.resize(end, false)
            .view
            .setInt16(start, v);

        return this;
    }
    writeInt16 = this.writeInt16BE;
    writeShortBE = this.writeInt16BE;
    writeShort = this.writeInt16BE;

    /**
     * Reads a 16-bit unsigned little-endian number
     */
    readUInt16LE(offset?: number): number {
        return this.view.getUint16(this.increaseOffset(2, offset).start, true);
    }
    readUShortLE = this.readUInt16LE;

    /**
     * Writes a 16-bit unsigned little-endian number
     */
    writeUInt16LE(v: number, offset?: number): this {

        const { start, end } = this.increaseOffset(2, offset);

        this.resize(end, false)
            .view
            .setUint16(start, v, true);

        return this;
    }
    writeUShortLE = this.writeUInt16LE;

    /**
     * Reads a 16-bit signed little-endian number
     */
    readInt16LE(offset?: number): number {
        return this.view.getInt16(this.increaseOffset(2, offset).start, true);
    }
    readShortLE = this.readInt16LE;

    /**
     * Writes a 16-bit signed little-endian number
     */
    writeInt16LE(v: number, offset?: number): this {

        const { start, end } = this.increaseOffset(2, offset);

        this.resize(end, false)
            .view
            .setInt16(start, v, true);

        return this;
    }
    writeShortLE = this.writeInt16LE;

    /**
     * Reads a 3-byte big-endian number
     */
    readTriadBE(offset?: number): number {
        return this.readByte(offset) << 16 | this.readByte() << 8 | this.readByte();
    }
    readTriad = this.readTriadBE;

    /**
     * Writes a 3-byte big-endian number
     */
    writeTriadBE(v: number, offset?: number): this {
        return this
            .writeByte(v >> 16 & 0xff, offset)
            .writeByte(v >> 8 & 0xff)
            .writeByte(v & 0xff);
    }
    writeTriad = this.writeTriadBE;

    /**
     * Reads a 3-byte little-endian number
     */
    readTriadLE(offset?: number): number {
        return this.readByte(offset) | this.readByte() << 8 | this.readByte() << 16;
    }

    /**
     * Writes a 3-byte little-endian number
     */
    writeTriadLE(v: number, offset?: number): this {
        return this
            .writeByte(v & 0xff, offset)
            .writeByte(v >> 8 & 0xff)
            .writeByte(v >> 16 & 0xff);
    }

    /**
     * Reads a 32-bit unsigned big-endian number
     */
    readUInt32BE(offset?: number): number {
        return this.view.getUint32(this.increaseOffset(4, offset).start);
    }
    readUInt32 = this.readUInt32BE;
    readUIntBE = this.readUInt32BE;
    readUInt = this.readUInt32BE;

    /**
     * Writes a 32-bit unsigned big-endian number
     */
    writeUInt32BE(v: number, offset?: number): this {
        const { start, end } = this.increaseOffset(4, offset);

        this.resize(end, false)
            .view
            .setUint32(start, v);

        return this;
    }
    writeUInt32 = this.writeUInt32BE;
    writeUIntBE = this.writeUInt32BE;
    writeUInt = this.writeUInt32BE;

    /**
     * Reads a 32-bit signed big-endian number
     */
    readInt32BE(offset?: number): number {
        return this.view.getInt32(this.increaseOffset(4, offset).start);
    }
    readInt32 = this.readInt32BE;
    readIntBE = this.readInt32BE;
    readInt = this.readInt32BE;


    /**
     * Writes a 32-bit signed big-endian number
     */
    writeInt32BE(v: number, offset?: number): this {

        const { start, end } = this.increaseOffset(4, offset);

        this.resize(end, false)
            .view
            .setInt32(start, v);

        return this;
    }
    writeInt32 = this.writeInt32BE;
    writeIntBE = this.writeInt32BE;
    writeInt = this.writeInt32BE;

    /**
     * Reads a 32-bit signed little-endian number
     */
    readInt32LE(offset?: number): number {
        return this.view.getInt32(this.increaseOffset(4, offset).start, true);
    }
    readIntLE = this.readInt32LE;

    /**
     * Writes a 32-bit signed little-endian number
     */
    writeInt32LE(v: number): this {
        const { start, end } = this.increaseOffset(4);

        this.resize(end, false)
            .view
            .setInt32(start, v, true);

        return this;
    }
    writeIntLE = this.writeInt32LE;

    /**
     * Reads a 32-bit unsigned little-endian number
     */
    readUInt32LE(offset?: number): number {
        return this.view.getUint32(this.increaseOffset(4, offset).start, true);
    }
    readUIntLE = this.readUInt32LE;

    /**
     * Writes a 32-bit unsigned little-endian number
     */
    writeUInt32LE(v: number, offset?: number): this {
        const { start, end } = this.increaseOffset(4, offset);

        this.resize(end, false)
            .view
            .setUint32(start, v, true);

        return this;
    }
    writeUIntLE = this.writeUInt32LE;

    /**
     * Reads a 32-bit big-endian float
     */
    readFloat32BE(offset?: number): number {
        return this.view.getFloat32(this.increaseOffset(4, offset).start);
    }
    readFloat32 = this.readFloat32BE;
    readFloatBE = this.readFloat32BE;
    readFloat = this.readFloat32BE;

    /**
     * Writes a 32-bit big-endian float
     */
    writeFloat32BE(v: number, offset?: number): this {
        const { start, end } = this.increaseOffset(4, offset);

        this.resize(end, false)
            .view
            .setFloat32(start, v);

        return this;
    }
    writeFloat32 = this.writeFloat32BE;
    writeFloatBE = this.writeFloat32BE;
    writeFloat = this.writeFloat32BE;

    /**
     * Reads a 32-bit little-endian float
     */
    readFloat32LE(offset?: number): number {
        return this.view.getFloat32(this.increaseOffset(4, offset).start, true);
    }
    readFloatLE = this.readFloat32LE;

    /**
     * Writes a 32-bit little-endian float
     */
    writeFloat32LE(v: number, offset?: number): this {
        const { start, end } = this.increaseOffset(4, offset);

        this.resize(end, false)
            .view
            .setFloat32(start, v, true);

        return this;
    }
    writeFloatLE = this.writeFloat32LE;

    /**
     * Reads a 64-bit big-endian float
     */
    readFloat64BE(offset?: number): number {
        return this.view.getFloat64(this.increaseOffset(8, offset).start);
    }
    readFloat64 = this.readFloat64BE;
    readDoubleBE = this.readFloat64BE;
    readDouble = this.readFloat64BE;

    /**
     * Writes a 64-bit big-endian float
     */
    writeFloat64BE(v: number, offset?: number): this {
        const { start, end } = this.increaseOffset(8, offset);

        this.resize(end, false)
            .view
            .setFloat64(start, v);

        return this;
    }
    writeFloat64 = this.writeFloat64BE;
    writeDoubleBE = this.writeFloat64BE;
    writeDouble = this.writeFloat64BE;

    /**
     * Reads a 64-bit little-endian flaot
     */
    readFloat64LE(offset?: number): number {
        return this.view.getFloat64(this.increaseOffset(8, offset).start, true);
    }
    readDoubleLE = this.readFloat64LE;

    /**
     * Writes a 64-bit little-endian float
     */
    writeFloat64LE(v: number, offset?: number): this {
        const { start, end } = this.increaseOffset(8, offset);

        this.resize(end, false)
            .view
            .setFloat64(start, v, true);

        return this;
    }
    writeDoubleLE = this.writeFloat64LE;

    /**
     * Reads a 64-bit unsigned big-endian bigint
     */
    readBigUInt64BE(offset: number = this.offset): bigint {
        return this.view.getBigUint64(this.increaseOffset(8, offset).start);
    }
    readBigUInt64 = this.readBigUInt64BE;
    readLongBE = this.readBigUInt64BE;
    readLong = this.readBigUInt64BE;

    /**
     * Writes a 64-bit unsigned big-endian bigint
     */
    writeBigUInt64BE(v: bigint, offset: number = this.offset): this {
        const { start, end } = this.increaseOffset(8, offset);

        this.resize(end, false)
            .view
            .setBigUint64(start, v);

        return this;
    }
    writeBigUInt64 = this.writeBigUInt64BE;
    writeLongBE = this.writeBigUInt64BE;
    writeLong = this.writeBigUInt64BE;

    /**
     * Reads a 64-bit unsigned little-endian bigint
     */
    readBigUInt64LE(offset: number = this.offset): bigint {
        return this.view.getBigUint64(this.increaseOffset(8, offset).start, true);
    }
    readLongLE = this.readBigUInt64LE;

    /**
     * Writes a 64-bit unsigned little-endian bigint
     */
    writeBigUInt64LE(v: bigint, offset: number = this.offset): this {
        const { start, end } = this.increaseOffset(8, offset);

        this.resize(end, false)
            .view
            .setBigUint64(start, v, true);

        return this;
    }
    writeLongLE = this.writeBigUInt64LE;

    /**
     * Reads a 35-bit unsigned varint
     */
    readUVarInt(offset: number = this.offset): number {
        let value = 0;

        for (let i = 0; i <= 35; i += 7) {
            let b = this.readByte(offset++);
            value |= ((b & 0x7f) << i);

            if ((b & 0x80) === 0) {
                return value;
            }
        }

        return 0;
    }

    /**
     * Writes a 35-bit unsigned varint
     */
    writeUVarInt(v: number, offset: number = this.offset): this {
        for (let i = 0; i < 5; i++) {
            if ((v >> 7) !== 0) {
                this.writeByte(v | 0x80, offset++);
            } else {
                this.writeByte(v & 0x7f, offset++);
                break;
            }
            v >>= 7;
        }

        return this;
    }

    /**
     * Reads a 35-bit signed varint
     */
    readVarInt(offset?: number): number {
        let raw = this.readUVarInt(offset);
        let tmp = (((raw << 63) >> 63) ^ raw) >> 1;
        return tmp ^ (raw & (1 << 63));
    }

    /**
     * Writes a 35-bit signed varint
     */
    writeVarInt(v: number, offset?: number): this {
        v <<= 32 >> 32;
        return this.writeUVarInt((v << 1) ^ (v >> 31), offset);
    }

    /**
     * Reads a 64-bit unsigned varlong
     */
    readUVarLong(offset: number = this.offset): bigint {
        let value = BigInt(0);
        for (let i = 0; i <= 63; i += 7) {
            let b = this.readByte(offset++);
            value |= BigInt((b & 0x7f) << i);

            if ((b & 0x80) === 0) {
                return value;
            }
        }
        return 0n;
    }

    /**
     * Writes a 64-bit unsigned varlong
     */
    writeUVarLong(v: bigint, offset: number = this.offset): this {
        while (v >= 0x80n) {
            this.writeByte(Number(v) | 0x80, offset++);
            v >>= 7n;
        }
        this.writeByte(Number(v), offset++);

        return this;
    }

    /**
     * Reads a 64-bit signed varlong
     */
    readVarLong(offset?: number): bigint {
        let raw = this.readUVarLong(offset);
        let tmp = (((raw << 63n) >> 63n) ^ raw) >> 1n;
        return tmp ^ (raw & (1n << 63n));
    }

    /**
     * Writes a 64-bit signed varlong
     */
    writeVarLong(v: bigint, offset?: number): this {
        return this.writeUVarLong((v << 1n) ^ (v >> 63n), offset);
    }

    /**
     * Checks if the stream has reached the end of the buffer
     */
    feof(): boolean {
        return this.offset >= this.length;
    }

    /**
     * Reads an address from the buffer
     */
    readAddress(offset?: number): InternetAddress {
        let address: string, port: number;
        let version = this.readByte(offset);
        switch (version) {
            default:
            case 4:
                let addr = [];
                for (let i = 0; i < 4; i++) {
                    addr.push(this.readByte() & 0xff);
                }
                address = addr.join(".");
                port = this.readUShort();
                break;

            case 6:
                let addr6 = [];
                for (let i = 0; i < 8; i++) {
                    addr6.push(this.readUShort().toString(16));
                }
                address = addr6.join(":");
                port = this.readUShort();
        }
        return { address, port, version };
    }

    /**
     * Writes address to buffer
     */
    writeAddress({ address, port, version }: InternetAddress, offset?: number): this {
        this.writeByte(version, offset);
        switch (version) {
            default:
            case 4:
                let parts = address.split(".", 4);
                for (let part of parts) {
                    this.writeByte((Number(part)) & 0xff);
                }
                this.writeUShort(port);
                break;

            case 6:
                let parts6 = address.split(":", 8);
                for (let part of parts6) {
                    this.writeUShort(parseInt(part, 16));
                }
                this.writeUShort(port);
        }
        return this;
    }

    /**
     * Sets the read/write offset to 0
     */
    flip(): this {
        this.offset = 0;
        return this;
    }

    /**
     * Converts the buffer to a string
     */
    toString(encoding: "hex" | "utf8" | string = "utf8"): string {
        switch (encoding) {
            case "hex":
                return Array.from(this.buffer, byte => byte.toString(16).padStart(2, "0")).join(" ");

            default:
                if (encoding === "binary") encoding = "latin1";
                return new TextDecoder(encoding).decode(this.view.buffer);
        }

    }

    /**
     * Splits the buffer into chunks of a specified size
     */
    split(bytes: number): Uint8Array[] {
        let buffers: ArrayBuffer[] = [];
        for (let i = 0; i < this.length; i += bytes) {
            buffers.push(this.view.buffer.slice(i, bytes));
        }
        return buffers.map(buffer => new Uint8Array(buffer));
    }


    /**
     * Creates a new BinaryStream from various sources
     */
    static from(buffer: ArrayBuffer | Uint8Array | number[]): BinaryStream;
    static from(str: string, encoding: "hex" | "utf8" | "latin1" | "binary"): BinaryStream;
    static from(buf: any, encoding?: any): BinaryStream {
        if (encoding === undefined) {
            return new BinaryStream(buf);
        }
        switch (encoding) {
            case "hex":
                let parts = /../g.exec(buf)!.map(part => parseInt(part, 16)).filter(part => !isNaN(part));
                return new BinaryStream(parts);

            case "utf8":
                return new BinaryStream(new TextEncoder().encode(buf));

            case "binary":
            case "latin1":
                return new BinaryStream((<string>buf).split("").map(char => char.charCodeAt(0)));

            default:
                throw new Error(`Unsupported encoding: ${encoding}`);
        }
    }

    /**
     * Writes a string to the buffer
     */
    writeString(str: string, offset?: number): this {
        let buffer = new TextEncoder().encode(str);
        return this.writeUInt32BE(buffer.length, offset).write(buffer);
    }

    /**
     * Reads a string from the buffer
     */
    readString(offset?: number): string {
        let length = this.readUInt32BE(offset);
        return new TextDecoder().decode(this.read(length));
    }
}
