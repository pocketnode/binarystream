import "./ArrayBufferTransferPolyfill";

/**
 * Represents an internet address.
 */
interface InternetAddress {
    address: string;
    port: number;
    version: number;
}

/**
 * Represents a binary stream for reading and writing data.
 */
class BinaryStream {
    protected view: DataView;
    public offset: number = 0;

    /**
     * Creates a new BinaryStream instance.
     * @param buffer The initial buffer for the stream.
     * @param offset The initial offset for the stream.
     */
    constructor(buffer: number[] | Uint8Array, offset?: number);
    constructor(buffer: ArrayBuffer, offset?: number);
    constructor(size: number);
    constructor();
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

    /**
     * Gets the underlying DataView of the stream.
     * @returns The DataView object.
     */
    getDataView(): DataView {
        return this.view;
    }

    /**
     * Resizes the buffer of the stream.
     * @param size The new size of the buffer.
     * @param canShrink Whether the buffer can be shrunk.
     * @returns The updated BinaryStream instance.
     */
    resize(size: number, canShrink: boolean = true): this {
        if (canShrink || (!canShrink && size > this.view.buffer.byteLength)) {
            this.view = new DataView(this.view.buffer.transfer(size));
        }
        return this;
    }

    /**
     * Checks if the current stream is equal to another stream or Uint8Array.
     * @param stream The stream or Uint8Array to compare.
     * @returns True if the streams are equal, false otherwise.
     */
    equals(stream: BinaryStream | Uint8Array): boolean {
        if (this.length !== stream.length) return false;
        let self = this.buffer;
        let other = stream instanceof BinaryStream ? stream.buffer : stream;
        for (let i = 0; i < self.byteLength; i++) {
            if (self[i] !== other[i]) return false;
        }
        return true;
    }

    /**
     * Increases the offset of the stream and returns the start and end offsets.
     * @param length The length to increase the offset by.
     * @param offset The optional offset to set.
     * @returns An object containing the start and end offsets.
     */
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
     * Reads a set of bytes from the buffer.
     * @param length The number of bytes to read.
     * @param offset The optional offset to read from.
     * @returns A Uint8Array containing the read bytes.
     * @throws RangeError if the read operation exceeds the buffer length.
     */
    read(length: number, offset?: number): Uint8Array {
        const { start, end } = this.increaseOffset(length, offset);
        if (start > this.length) {
            throw new RangeError(`Buffer overrun, cannot read past the end of the buffer. Start: ${start}, End: ${end}, Length: ${this.length}`);
        }

        return new Uint8Array(this.view.buffer.slice(start, end));
    }

    /**
     * Writes data to the stream's buffer.
     * @param buffer The data to write.
     * @param offset The optional offset to write the data at.
     * @returns The updated BinaryStream instance.
     */
    write(stream: BinaryStream, offset?: number): this;
    write(buffer: ArrayBuffer, offset?: number): this;
    write(buffer: Uint8Array | number[], offset?: number): this;
    write(buffer: any, offset?: number): this {
        if (buffer instanceof ArrayBuffer) {
            buffer = new Uint8Array(buffer);
        } else if (buffer instanceof BinaryStream) {
            buffer = buffer.buffer;
        }

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
     * Resets the stream's buffer.
     * @returns The updated BinaryStream instance.
     */
    reset(): this {
        return this.resize(0).flip();
    }

    /**
     * Sets the buffer and/or offset of the stream.
     * @param buffer The buffer to set.
     * @param offset The optional offset to set.
     * @returns The updated BinaryStream instance.
     */
    setBuffer(buffer: Uint8Array | number[], offset: number = 0): this {
        this.reset().write(buffer);
        this.offset = offset;
        return this;
    }

    /**
     * Gets a copy of the underlying ArrayBuffer as a Uint8Array.
     * @returns A copy of the ArrayBuffer.
     */
    get buffer(): Uint8Array {
        return new Uint8Array(this.view.buffer);
    }

    /**
     * Gets the size of the buffer.
     * @returns The size of the buffer.
     */
    get length(): number {
        return this.view.buffer.byteLength;
    }

    get arrayBuffer(): ArrayBuffer {
        return this.view.buffer;
    }

    /**
     * Creates a Blob from the buffer.
     * @param type The MIME type of the Blob.
     * @returns The created Blob object.
     */
    blob(type: string = "application/octet-stream"): Blob {
        return new Blob([this.view.buffer], { type });
    }

    /**
     * Gets the amount of remaining bytes that can be read.
     * @returns The number of remaining bytes.
     */
    getRemainingBytes(): number {
        return this.length - this.offset;
    }

    /**
     * Reads the remaining amount of bytes.
     * @returns A Uint8Array containing the remaining bytes.
     */
    readRemainingBytes(): Uint8Array {
        return this.read(this.getRemainingBytes());
    }

    /**
     * Reads a boolean value.
     * @param offset The optional offset to read from.
     * @returns boolean value.
     */
    readBool(offset?: number): boolean {
        return this.readByte(offset) !== 0;
    }
    /** @inheritDoc BinaryStream.readBool */
    readBoolean = this.readBool;

    /**
     * Writes a boolean value.
     * @param v The boolean value to write.
     * @param offset The optional offset to write at.
     * @returns The updated BinaryStream instance.
     */
    writeBool(v: boolean, offset?: number): this {
        return this.writeByte(Number(v), offset);
    }
    /** @inheritDoc BinaryStream.writeBool */
    writeBoolean = this.writeBool;

    /**
     * Reads an unsigned 8-bit number.
     * @param offset The optional offset to read from.
     * @returns The read unsigned 8-bit number.
     */
    readUInt8(offset?: number): number {
        return this.view.getUint8(this.increaseOffset(1, offset).start);
    }

    /**
     * Reads an unsigned/signed byte.
     * @param offset The optional offset to read from.
     * @returns The read byte.
     */
    readByte = this.readUInt8;

    /**
     * Writes an unsigned 8-bit number.
     * @param v The unsigned 8-bit number to write.
     * @param offset The optional offset to write at.
     * @returns The updated BinaryStream instance.
     */
    writeUInt8(v: number, offset?: number): this {
        const { start, end } = this.increaseOffset(1, offset);

        this.resize(end, false)
            .view
            .setUint8(start, v);

        return this;
    }

    /**
     * Reads a signed 8-bit number.
     * @param offset The optional offset to read from.
     * @returns The read signed 8-bit number.
     */
    readInt8(offset?: number): number {
        return this.view.getInt8(this.increaseOffset(1, offset).start);
    }

    /**
     * Writes a signed 8-bit number.
     * @param v The signed 8-bit number to write.
     * @param offset The optional offset to write at.
     * @returns The updated BinaryStream instance.
     */
    writeInt8(v: number, offset?: number): this {
        const { start, end } = this.increaseOffset(1, offset);

        this.resize(end, false)
            .view
            .setInt8(start, v);

        return this;
    }

    /**
     * Writes an unsigned/signed byte.
     * @param v The byte to write.
     * @param offset The optional offset to write at.
     * @returns The updated BinaryStream instance.
     */
    writeByte = this.writeUInt8;

    /**
     * Reads a 16-bit unsigned big-endian number.
     * @param offset The optional offset to read from.
     * @returns The read 16-bit unsigned big-endian number.
     */
    readUInt16BE(offset?: number): number {
        return this.view.getUint16(this.increaseOffset(2, offset).start);
    }
    /** @inheritDoc BinaryStream.readUInt16BE */
    readUInt16 = this.readUInt16BE;
    /** @inheritDoc BinaryStream.readUInt16BE */
    readUShortBE = this.readUInt16BE;
    /** @inheritDoc BinaryStream.readUInt16BE */
    readUShort = this.readUInt16BE;

    /**
     * Writes a 16-bit unsigned big-endian number.
     * @param v The 16-bit unsigned big-endian number to write.
     * @param offset The optional offset to write at.
     * @returns The updated BinaryStream instance.
     */
    writeUInt16BE(v: number, offset?: number): this {
        const { start, end } = this.increaseOffset(2, offset);

        this.resize(end, false)
            .view
            .setUint16(start, v);

        return this;
    }
    /** @inheritDoc BinaryStream.writeUInt16BE */
    writeUInt16 = this.writeUInt16BE;
    /** @inheritDoc BinaryStream.writeUInt16BE */
    writeUShortBE = this.writeUInt16BE;
    /** @inheritDoc BinaryStream.writeUInt16BE */
    writeUShort = this.writeUInt16BE;

    /**
     * Reads a 16-bit signed big-endian number.
     * @param offset The optional offset to read from.
     * @returns The read 16-bit signed big-endian number.
     */
    readInt16BE(offset?: number): number {
        return this.view.getInt16(this.increaseOffset(2, offset).start);
    }
    /** @inheritDoc BinaryStream.readInt16BE */
    readInt16 = this.readInt16BE;
    /** @inheritDoc BinaryStream.readInt16BE */
    readShortBE = this.readInt16BE;
    /** @inheritDoc BinaryStream.readInt16BE */
    readShort = this.readInt16BE;

    /**
     * Writes a 16-bit signed big-endian number.
     * @param v The 16-bit signed big-endian number to write.
     * @param offset The optional offset to write at.
     * @returns The updated BinaryStream instance.
     */
    writeInt16BE(v: number, offset?: number): this {
        const { start, end } = this.increaseOffset(2, offset);

        this.resize(end, false)
            .view
            .setInt16(start, v);

        return this;
    }
    /** @inheritDoc BinaryStream.writeInt16BE */
    writeInt16 = this.writeInt16BE;
    /** @inheritDoc BinaryStream.writeInt16BE */
    writeShortBE = this.writeInt16BE;
    /** @inheritDoc BinaryStream.writeInt16BE */
    writeShort = this.writeInt16BE;

    /**
     * Reads a 16-bit unsigned little-endian number.
     * @param offset The optional offset to read from.
     * @returns The read 16-bit unsigned little-endian number.
     */
    readUInt16LE(offset?: number): number {
        return this.view.getUint16(this.increaseOffset(2, offset).start, true);
    }
    /** @inheritDoc BinaryStream.readUInt16LE */
    readUShortLE = this.readUInt16LE;

    /**
     * Writes a 16-bit unsigned little-endian number.
     * @param v The 16-bit unsigned little-endian number to write.
     * @param offset The optional offset to write at.
     * @returns The updated BinaryStream instance.
     */
    writeUInt16LE(v: number, offset?: number): this {
        const { start, end } = this.increaseOffset(2, offset);

        this.resize(end, false)
            .view
            .setUint16(start, v, true);

        return this;
    }
    /** @inheritDoc BinaryStream.writeUInt16LE */
    writeUShortLE = this.writeUInt16LE;

    /**
     * Reads a 16-bit signed little-endian number.
     * @param offset The optional offset to read from.
     * @returns The read 16-bit signed little-endian number.
     */
    readInt16LE(offset?: number): number {
        return this.view.getInt16(this.increaseOffset(2, offset).start, true);
    }
    /** @inheritDoc BinaryStream.readInt16LE */
    readShortLE = this.readInt16LE;

    /**
     * Reads a 32-bit unsigned big-endian number.
     * @param offset The optional offset to read from.
     * @returns The read 32-bit unsigned big-endian number.
     */
    readUInt32BE(offset?: number): number {
        return this.view.getUint32(this.increaseOffset(4, offset).start);
    }
    /** @inheritDoc BinaryStream.readUInt32BE */
    readUInt32 = this.readUInt32BE;
    /** @inheritDoc BinaryStream.readUInt32BE */
    readUIntBE = this.readUInt32BE;
    /** @inheritDoc BinaryStream.readUInt32BE */
    readUInt = this.readUInt32BE;

    /**
     * Writes a 32-bit unsigned big-endian number.
     * @param v The 32-bit unsigned big-endian number to write.
     * @param offset The optional offset to write at.
     * @returns The updated BinaryStream instance.
     */
    writeUInt32BE(v: number, offset?: number): this {
        const { start, end } = this.increaseOffset(4, offset);

        this.resize(end, false)
            .view
            .setUint32(start, v);

        return this;
    }
    /** @inheritDoc BinaryStream.writeUInt32BE */
    writeUInt32 = this.writeUInt32BE;
    /** @inheritDoc BinaryStream.writeUInt32BE */
    writeUIntBE = this.writeUInt32BE;
    /** @inheritDoc BinaryStream.writeUInt32BE */
    writeUInt = this.writeUInt32BE;

    /**
     * Reads a 32-bit signed big-endian number
     */
    readInt32BE(offset?: number): number {
        return this.view.getInt32(this.increaseOffset(4, offset).start);
    }
    /** @inheritDoc BinaryStream.readInt32BE */
    readInt32 = this.readInt32BE;
    /** @inheritDoc BinaryStream.readInt32BE */
    readIntBE = this.readInt32BE;
    /** @inheritDoc BinaryStream.readInt32BE */
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
    /** @inheritDoc BinaryStream.writeInt32BE */
    writeInt32 = this.writeInt32BE;
    /** @inheritDoc BinaryStream.writeInt32BE */
    writeIntBE = this.writeInt32BE;
    /** @inheritDoc BinaryStream.writeInt32BE */
    writeInt = this.writeInt32BE;

    /**
     * Reads a 32-bit signed little-endian number
     */
    readInt32LE(offset?: number): number {
        return this.view.getInt32(this.increaseOffset(4, offset).start, true);
    }
    /** @inheritDoc BinaryStream.readInt32LE */
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
    /** @inheritDoc BinaryStream.writeInt32LE */
    writeIntLE = this.writeInt32LE;

    /**
     * Reads a 32-bit unsigned little-endian number
     */
    readUInt32LE(offset?: number): number {
        return this.view.getUint32(this.increaseOffset(4, offset).start, true);
    }
    /** @inheritDoc BinaryStream.readUInt32LE */
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
    /** @inheritDoc BinaryStream.writeUInt32LE */
    writeUIntLE = this.writeUInt32LE;

    /**
     * Writes a 16-bit signed little-endian number.
     * @param v The 16-bit signed little-endian number to write.
     * @param offset The optional offset to write at.
     * @returns The updated BinaryStream instance.
     */
    writeInt16LE(v: number, offset?: number): this {
        const { start, end } = this.increaseOffset(2, offset);

        this.resize(end, false)
            .view
            .setInt16(start, v, true);

        return this;
    }
    /** @inheritDoc BinaryStream.writeInt16LE */
    writeShortLE = this.writeInt16LE;

    /**
     * Reads a 3-byte big-endian number.
     * @param offset The optional offset to read from.
     * @returns The read 3-byte big-endian number.
     */
    readTriadBE(offset?: number): number {
        return this.readByte(offset) << 16 | this.readByte() << 8 | this.readByte();
    }
    /** @inheritDoc BinaryStream.readTriadBE */
    readTriad = this.readTriadBE;

    /**
     * Writes a 3-byte big-endian number.
     * @param v The 3-byte big-endian number to write.
     * @param offset The optional offset to write at.
     * @returns The updated BinaryStream instance.
     */
    writeTriadBE(v: number, offset?: number): this {
        return this
            .writeByte(v >> 16 & 0xff, offset)
            .writeByte(v >> 8 & 0xff)
            .writeByte(v & 0xff);
    }
    /** @inheritDoc BinaryStream.writeTriadBE */
    writeTriad = this.writeTriadBE;

    /**
     * Reads a 3-byte little-endian number.
     * @param offset The optional offset to read from.
     * @returns The read 3-byte little-endian number.
     */
    readTriadLE(offset?: number): number {
        return this.readByte(offset) | this.readByte() << 8 | this.readByte() << 16;
    }

    /**
     * Writes a 3-byte little-endian number.
     * @param v The 3-byte little-endian number to write.
     * @param offset The optional offset to write at.
     * @returns The updated BinaryStream instance.
     */
    writeTriadLE(v: number, offset?: number): this {
        return this
            .writeByte(v & 0xff, offset)
            .writeByte(v >> 8 & 0xff)
            .writeByte(v >> 16 & 0xff);
    }

    /**
     * Reads a 32-bit floating point number in big-endian format from the binary stream.
     * @param offset - The optional offset to read from.
     * @returns The 32-bit floating point number read from the binary stream.
     */
    readFloat32BE(offset?: number): number {
        return this.view.getFloat32(this.increaseOffset(4, offset).start);
    }
    /** @inheritDoc BinaryStream.readFloat32BE */
    readFloat32 = this.readFloat32BE;
    /** @inheritDoc BinaryStream.readFloat32BE */
    readFloatBE = this.readFloat32BE;
    /** @inheritDoc BinaryStream.readFloat32BE */
    readFloat = this.readFloat32BE;

    /**
     * Writes a 32-bit floating-point number in big-endian format to the binary stream.
     * @param v - The value to write.
     * @param offset - The optional offset at which to write the value.
     * @returns The updated BinaryStream instance.
     */
    writeFloat32BE(v: number, offset?: number): this {
        const { start, end } = this.increaseOffset(4, offset);

        this.resize(end, false)
            .view
            .setFloat32(start, v);

        return this;
    }
    /** @inheritDoc BinaryStream.writeFloat32BE */
    writeFloat32 = this.writeFloat32BE;
    /** @inheritDoc BinaryStream.writeFloat32BE */
    writeFloatBE = this.writeFloat32BE;
    /** @inheritDoc BinaryStream.writeFloat32BE */
    writeFloat = this.writeFloat32BE;

    /**
     * Reads a 32-bit floating-point number in little-endian format from the binary stream.
     * @param offset - The optional offset to read from.
     * @returns The 32-bit floating-point number read from the binary stream.
     */
    readFloat32LE(offset?: number): number {
        return this.view.getFloat32(this.increaseOffset(4, offset).start, true);
    }
    /** @inheritDoc BinaryStream.readFloat32LE */
    readFloatLE = this.readFloat32LE;

    /**
     * Writes a 32-bit floating-point number in little-endian format to the binary stream.
     * @param v - The value to write.
     * @param offset - The optional offset at which to write the value.
     * @returns The updated BinaryStream instance.
     */
    writeFloat32LE(v: number, offset?: number): this {
        const { start, end } = this.increaseOffset(4, offset);

        this.resize(end, false)
            .view
            .setFloat32(start, v, true);

        return this;
    }
    /** @inheritDoc BinaryStream.writeFloat32LE */
    writeFloatLE = this.writeFloat32LE;

    /**
     * Reads an 8-byte floating-point number in big-endian format from the binary stream.
     * @param offset - The optional offset to read from. If not provided, the current offset will be used.
     * @returns The 8-byte floating-point number read from the binary stream.
     */
    readFloat64BE(offset?: number): number {
        return this.view.getFloat64(this.increaseOffset(8, offset).start);
    }
    /** @inheritDoc BinaryStream.readFloat64BE */
    readFloat64 = this.readFloat64BE;
    /** @inheritDoc BinaryStream.readFloat64BE */
    readDoubleBE = this.readFloat64BE;
    /** @inheritDoc BinaryStream.readFloat64BE */
    readDouble = this.readFloat64BE;

    /**
     * Writes an 8-byte floating-point number in big-endian format to the binary stream.
     * @param v - The value to write.
     * @param offset - The optional offset at which to write the value.
     * @returns The updated BinaryStream instance.
     */
    writeFloat64BE(v: number, offset?: number): this {
        const { start, end } = this.increaseOffset(8, offset);

        this.resize(end, false)
            .view
            .setFloat64(start, v);

        return this;
    }
    /** @inheritDoc BinaryStream.writeFloat64BE */
    writeFloat64 = this.writeFloat64BE;
    /** @inheritDoc BinaryStream.writeFloat64BE */
    writeDoubleBE = this.writeFloat64BE;
    /** @inheritDoc BinaryStream.writeFloat64BE */
    writeDouble = this.writeFloat64BE;

    /**
     * Reads an 8-byte floating-point number in little-endian format from the binary stream.
     * @param offset - The optional offset to read from.
     * @returns The 8-byte floating-point number read from the binary stream.
     */
    readFloat64LE(offset?: number): number {
        return this.view.getFloat64(this.increaseOffset(8, offset).start, true);
    }
    /** @inheritDoc BinaryStream.readFloat64LE */
    readDoubleLE = this.readFloat64LE;

    /**
     * Writes an 8-byte floating-point number in little-endian format to the binary stream.
     * @param v - The value to write.
     * @param offset - The optional offset at which to write the value.
     * @returns The updated BinaryStream instance.
     */
    writeFloat64LE(v: number, offset?: number): this {
        const { start, end } = this.increaseOffset(8, offset);

        this.resize(end, false)
            .view
            .setFloat64(start, v, true);

        return this;
    }
    /** @inheritDoc BinaryStream.writeFloat64LE */
    writeDoubleLE = this.writeFloat64LE;

    /**
     * Reads an unsigned 64-bit big-endian integer from the binary stream.
     * @param offset - The optional offset to read from.
     * @returns The unsigned 64-bit big-endian integer read from the binary stream.
     */
    readBigUInt64BE(offset: number = this.offset): bigint {
        return this.view.getBigUint64(this.increaseOffset(8, offset).start);
    }
    /** @inheritDoc BinaryStream.readBigUInt64BE */
    readBigUInt64 = this.readBigUInt64BE;
    /** @inheritDoc BinaryStream.readBigUInt64BE */
    readLongBE = this.readBigUInt64BE;
    /** @inheritDoc BinaryStream.readBigUInt64BE */
    readLong = this.readBigUInt64BE;

    /**
     * Writes an unsigned 64-bit big-endian integer to the binary stream.
     * @param v - The value to write.
     * @param offset - The optional offset at which to write the value.
     * @returns The updated BinaryStream instance.
     */
    writeBigUInt64BE(v: bigint, offset: number = this.offset): this {
        const { start, end } = this.increaseOffset(8, offset);

        this.resize(end, false)
            .view
            .setBigUint64(start, v);

        return this;
    }
    /** @inheritDoc BinaryStream.writeBigUInt64BE */
    writeBigUInt64 = this.writeBigUInt64BE;
    /** @inheritDoc BinaryStream.writeBigUInt64BE */
    writeLongBE = this.writeBigUInt64BE;
    /** @inheritDoc BinaryStream.writeBigUInt64BE */
    writeLong = this.writeBigUInt64BE;

    /**
     * Reads an unsigned 64-bit little-endian integer from the binary stream.
     * @param offset - The optional offset to read from.
     * @returns The unsigned 64-bit little-endian integer read from the binary stream.
     */
    readBigUInt64LE(offset: number = this.offset): bigint {
        return this.view.getBigUint64(this.increaseOffset(8, offset).start, true);
    }
    /** @inheritDoc BinaryStream.readBigUInt64LE */
    readLongLE = this.readBigUInt64LE;

    /**
     * Writes an unsigned 64-bit little-endian integer to the binary stream.
     * @param v - The value to write.
     * @param offset - The optional offset at which to write the value.
     * @returns The updated BinaryStream instance.
     */
    writeBigUInt64LE(v: bigint, offset: number = this.offset): this {
        const { start, end } = this.increaseOffset(8, offset);

        this.resize(end, false)
            .view
            .setBigUint64(start, v, true);

        return this;
    }
    /** @inheritDoc BinaryStream.writeBigUInt64LE */
    writeLongLE = this.writeBigUInt64LE;

    /**
     * Reads an unsigned variable-length integer from the binary stream.
     * @param offset - The optional offset to read from.
     * @returns The unsigned variable-length integer read from the stream.
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
     * Writes an unsigned variable-length integer to the binary stream.
     * @param v - The value to write.
     * @param offset - The optional offset at which to write the value.
     * @returns The updated BinaryStream instance.
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
     * Reads a variable-length integer from the binary stream.
     * @param offset - The optional offset to read from.
     * @returns The read variable-length integer.
     */
    readVarInt(offset?: number): number {
        let raw = this.readUVarInt(offset);
        let tmp = (((raw << 63) >> 63) ^ raw) >> 1;
        return tmp ^ (raw & (1 << 63));
    }

    /**
     * Writes a variable-length integer to the binary stream.
     * @param v - The value to write.
     * @param offset - The optional offset at which to write the value.
     * @returns The updated BinaryStream instance.
     */
    writeVarInt(v: number, offset?: number): this {
        v <<= 32 >> 32;
        return this.writeUVarInt((v << 1) ^ (v >> 31), offset);
    }

    /**
     * Reads an unsigned variable-length long integer from the binary stream.
     * @param offset - The optional offset to read from.
     * @returns The unsigned variable-length long integer read from the stream.
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
     * Writes an unsigned variable-length long integer to the binary stream.
     * @param v - The value to write.
     * @param offset - The optional offset at which to write the value.
     * @returns The updated BinaryStream instance.
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
     * Reads a variable-length long integer from the binary stream.
     * @param offset - The optional offset to read from.
     * @returns The read long integer value.
     */
    readVarLong(offset?: number): bigint {
        let raw = this.readUVarLong(offset);
        let tmp = (((raw << 63n) >> 63n) ^ raw) >> 1n;
        return tmp ^ (raw & (1n << 63n));
    }

    /**
     * Writes a variable-length long integer to the binary stream.
     * @param v - The value to write.
     * @param offset - The optional offset at which to write the value.
     * @returns The updated BinaryStream instance.
     */
    writeVarLong(v: bigint, offset?: number): this {
        return this.writeUVarLong((v << 1n) ^ (v >> 63n), offset);
    }

    /**
     * Checks if the current offset has reached the end of the binary stream.
     * @returns A boolean indicating whether the end of the stream has been reached.
     */
    feof(): boolean {
        return this.offset >= this.length;
    }

    /**
     * Reads an Internet address from the binary stream.
     * @param offset - The optional offset to read from.
     * @returns An object representing the Internet address, including the address, port, and version.
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
     * Writes an Internet address to the binary stream.
     * @param address - The Internet address to write.
     * @param offset - The optional offset to write at.
     * @returns The updated BinaryStream instance.
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
     * Flips the binary stream by resetting the offset to 0.
     * @returns The updated BinaryStream instance.
     */
    flip(): this {
        this.offset = 0;
        return this;
    }

    /**
     * Converts the binary stream to a string.
     * @param encoding - The encoding to use.
     * @returns The string representation of the binary stream.
     */
    toString(encoding: "hex" | "utf8" | string = "utf8"): string {
        switch (encoding) {
            case "hex":
                return Array.from(this.buffer, byte => byte.toString(16).padStart(2, "0")).join("");

            default:
                if (encoding === "binary") encoding = "latin1";
                return new TextDecoder(encoding).decode(this.view.buffer);
        }

    }

    /**
     * Splits the binary stream into chunks of the specified number of bytes.
     * @param bytes The number of bytes in each chunk.
     * @returns An array of Uint8Array chunks.
     */
    split(bytes: number): Uint8Array[] {
        let buffers: ArrayBuffer[] = [];
        for (let i = 0; i < this.length; i += bytes) {
            buffers.push(this.view.buffer.slice(i, bytes));
        }
        return buffers.map(buffer => new Uint8Array(buffer));
    }

    /**
     * Creates a new BinaryStream from the specified buffer.
     * @param buffer - The buffer to create the BinaryStream from.
     * @overload
     * @returns The created BinaryStream instance.
     */
    static from(buffer: ArrayBuffer | Uint8Array | number[]): BinaryStream;
    /**
     * Creates a new BinaryStream from the specified string.
     * @param str - The string to create the BinaryStream from.
     * @param encoding - The encoding to use.
     * @overload
     * @returns The created BinaryStream instance.
     */
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

export {
    BinaryStream as default,
    BinaryStream,
    type InternetAddress
};