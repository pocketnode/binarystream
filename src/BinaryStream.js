const Round = require("./Round");
class BinaryStream {
    /**
     * @param buffer {Buffer|null}
     */
    constructor(buffer = null){
        /** @type {Buffer} */
        this.buffer = Buffer.alloc(0);
        /** @type {number} */
        this.offset = 0;

        if(buffer instanceof Buffer){
            this.append(buffer);
            this.offset = 0;
        }
    }

    /*
     *******************************
     * Stream Management Functions *
     *******************************
    */

    /**
     * Read a set of bytes from the buffer
     * @param len {number}
     * @return {Buffer}
     */
    read(len){
        return this.buffer.slice(this.offset, this.increaseOffset(len, true));
    }

    /**
     * Reset the buffer
     */
    reset(){
        this.buffer = Buffer.alloc(0);
        this.offset = 0;
    }

    /**
     * Set the buffer and/or offset
     * @param buffer {Buffer}
     * @param offset {number}
     */
    setBuffer(buffer = Buffer.alloc(0), offset = 0){
        this.buffer = buffer;
        this.offset = offset;
    }

    /**
     * Increase the stream's offset
     * @param v   {number}
     * @param ret {boolean}
     * @return {number}
     */
    increaseOffset(v, ret = false){
        return (ret === true ? (this.offset += v) : (this.offset += v) - v);
    }

    /**
     * Append data to stream's buffer
     * @param buf {*}
     * @return {BinaryStream}
     */
    append(buf){
        if(buf instanceof Buffer){
            this.buffer = Buffer.concat([this.buffer, buf]);
            this.offset += buf.length;
        }else if(typeof buf === "string"){
            buf = Buffer.from(buf, "hex");
            this.buffer = Buffer.concat([this.buffer, buf]);
            this.offset += buf.length;
        }else if(Array.isArray(buf)){
            buf = Buffer.from(buf);
            this.buffer = Buffer.concat([this.buffer, buf]);
            this.offset += buf.length;
        }
        return this;
    }

    /**
     * Get the read/write offset of the stream
     * @return {number}
     */
    getOffset(){
        return this.offset;
    }

    /**
     * Get the stream's buffer
     * @return {Buffer}
     */
    getBuffer(){
        return this.buffer;
    }

    /**
     * Shortcut for <BinaryStream>.buffer.length
     * @return {number}
     */
    get length(){
        return this.buffer.length;
    }

    /*
     *******************************
     * Buffer Management Functions *
     *******************************
    */

    /**
     * Get the amount of remaining bytes that can be read
     * @return {number}
     */
    getRemainingBytes(){
        return this.buffer.length - this.offset;
    }

    /**
     * Read the remaining amount of bytes
     * @return {Buffer}
     */
    readRemaining(){
        let buf = this.buffer.slice(this.offset);
        this.offset = this.buffer.length;
        return buf;
    }

    /**
     * Reads a byte boolean
     * @return {boolean}
     */
    readBool(){
        return this.readByte() !== 0;
    }

    /**
     * Writes a byte boolean
     * @param v {boolean}
     * @return {BinaryStream}
     */
    writeBool(v){
        this.writeByte(v === true ? 1 : 0);
        return this;
    }

    /**
     * Reads a unsigned/signed byte
     * @return {number}
     */
    readByte(){
        return this.getBuffer()[this.increaseOffset(1)];
    }

    /**
     * Writes a unsigned/signed byte
     * @param v {number}
     * @return {BinaryStream}
     */
    writeByte(v){
        this.append(Buffer.from([v & 0xff]));

        return this;
    }

    /**
     * Reads a 16-bit unsigned or signed big-endian number
     * @return {number}
     */
    readShort(){
        return this.buffer.readUInt16BE(this.increaseOffset(2));
    }

    /**
     * Writes a 16-bit unsigned big-endian number
     * @param v {number}
     * @return {BinaryStream}
     */
    writeShort(v){
        let buf = Buffer.alloc(2);
        buf.writeUInt16BE(v, 0);
        this.append(buf);

        return this;
    }

    /**
     * Reads a 16-bit signed big-endian number
     * @return {number}
     */
    readSignedShort(){
        return this.buffer.readInt16BE(this.increaseOffset(2));
    }

    /**
     * Writes a 16-bit signed big-endian number
     * @param v {number}
     * @return {BinaryStream}
     */
    writeSignedShort(v){
        let buf = Buffer.alloc(2);
        buf.writeInt16BE(v, 0);
        this.append(buf);

        return this;
    }

    /**
     * Reads a 16-bit unsigned little-endian number
     * @return {number}
     */
    readLShort(){
        return this.buffer.readUInt16LE(this.increaseOffset(2));
    }

    /**
     * Writes a 16-bit unsigned little-endian number
     * @param v {number}
     * @return {BinaryStream}
     */
    writeLShort(v){
        let buf = Buffer.alloc(2);
        buf.writeUInt16LE(v, 0);
        this.append(buf);

        return this;
    }

    /**
     * Reads a 16-bit signed little-endian number
     * @return {number}
     */
    readSignedLShort(){
        return this.buffer.readInt16LE(this.increaseOffset(2));
    }

    /**
     * Writes a 16-bit signed little-endian number
     * @param v {number}
     * @return {BinaryStream}
     */
    writeSignedLShort(v){
        let buf = Buffer.alloc(2);
        buf.writeInt16LE(v, 0);
        this.append(buf);

        return this;
    }

    /**
     * Reads a 3-byte big-endian number
     * @return {number}
     */
    readTriad(){
        return this.buffer.readUIntBE(this.increaseOffset(3), 3);
    }

    /**
     * Writes a 3-byte big-endian number
     * @param v {number}
     * @return {BinaryStream}
     */
    writeTriad(v){
        let buf = Buffer.alloc(3);
        buf.writeUIntBE(v, 0, 3);
        this.append(buf);

        return this;
    }

    /**
     * Reads a 3-byte little-endian number
     * @return {number}
     */
    readLTriad(){
        return this.buffer.readUIntLE(this.increaseOffset(3), 3);
    }

    /**
     * Writes a 3-byte little-endian number
     * @param v {number}
     * @return {BinaryStream}
     */
    writeLTriad(v){
        let buf = Buffer.alloc(3);
        buf.writeUIntLE(v, 0, 3);
        this.append(buf);

        return this;
    }

    /**
     * Reads a 32-bit signed big-endian number
     * @return {number}
     */
    readInt(){
        return this.buffer.readInt32BE(this.increaseOffset(4));
    }

    /**
     * Writes a 32-bit signed big-endian number
     * @param v {number}
     * @return {BinaryStream}
     */
    writeInt(v){
        let buf = Buffer.alloc(4);
        buf.writeInt32BE(v, 0);
        this.append(buf);

        return this;
    }

    /**
     * Reads a 32-bit signed little-endian number
     * @return {number}
     */
    readLInt(){
        return this.buffer.readInt32LE(this.increaseOffset(4));
    }

    /**
     * Writes a 32-bit signed little-endian number
     * @param v {number}
     * @return {BinaryStream}
     */
    writeLInt(v){
        let buf = Buffer.alloc(4);
        buf.writeInt32LE(v, 0);
        this.append(buf);

        return this;
    }

    /**
     * @return {number}
     */
    readFloat(){
        return this.buffer.readFloatBE(this.increaseOffset(4));
    }

    /**
     * @param accuracy {number}
     * @return {number}
     */
    readRoundedFloat(accuracy){
        return Round(this.readFloat(), accuracy);
    }

    /**
     * @param v {number}
     * @return {BinaryStream}
     */
    writeFloat(v) {
        let buf = Buffer.alloc(8);
        let bytes = buf.writeFloatBE(v, 0);
        this.append(buf.slice(0, bytes));

        return this;
    }

    /**
     * @return {number}
     */
    readLFloat(){
        return this.buffer.readFloatLE(this.increaseOffset(4));
    }

    /**
     * @param accuracy {number}
     * @return {number}
     */
    readRoundedLFloat(accuracy){
        return Round(this.readLFloat(), accuracy);
    }

    /**
     * @param v {number}
     * @return {BinaryStream}
     */
    writeLFloat(v){
        let buf = Buffer.alloc(8);
        let bytes = buf.writeFloatLE(v, 0);
        this.append(buf.slice(0, bytes));

        return this;
    }

    /**
     * @return {number}
     */
    readDouble(){
        return this.buffer.readDoubleBE(this.increaseOffset(8));
    }

    /**
     * @param v {number}
     * @return {BinaryStream}
     */
    writeDouble(v) {
        let buf = Buffer.alloc(8);
        buf.writeDoubleBE(v, 0);
        this.append(buf);

        return this;
    }

    /**
     * @return {number}
     */
    readLDouble(){
        return this.buffer.readDoubleLE(this.increaseOffset(8));
    }

    /**
     * @param v {number}
     * @return {BinaryStream}
     */
    writeLDouble(v){
        let buf = Buffer.alloc(8);
        buf.writeDoubleLE(v, 0);
        this.append(buf);

        return this;
    }

    /**
     * @return {number}
     */
    readLong(){
        return (this.buffer.readUInt32BE(this.increaseOffset(4)) << 8) + this.buffer.readUInt32BE(this.increaseOffset(4));
    }

    /**
     * @param v {number}
     * @return {BinaryStream}
     */
    writeLong(v){
        let MAX_UINT32 = 0xFFFFFFFF;

        let buf = Buffer.alloc(8);
        buf.writeUInt32BE((~~(v / MAX_UINT32)), 0);
        buf.writeUInt32BE((v & MAX_UINT32), 4);
        this.append(buf);

        return this;
    }

    readLLong(){
        return this.buffer.readUInt32LE(0) + (buffer.readUInt32LE(4) << 8);
    }

    writeLLong(v){
        let MAX_UINT32 = 0xFFFFFFFF;

        let buf = Buffer.alloc(8);
        buf.writeUInt32LE((v & MAX_UINT32), 0);
        buf.writeUInt32LE((~~(v / MAX_UINT32)), 4);
        this.append(buf);

        return this;
    }

    /**
     * @return {number}
     */
    readUnsignedVarInt(){
        let value = 0;

        for(let i = 0; i <= 35; i += 7){
            let b = this.readByte();
            value |= ((b & 0x7f) << i);

            if((b & 0x80) === 0){
                return value;
            }
        }

        return 0;
    }

    /**
     * @param v {number}
     * @return {BinaryStream}
     */
    writeUnsignedVarInt(v){
        let stream = new BinaryStream();

        for(let i = 0; i < 5; i++){
            if((v >> 7) !== 0){
                stream.writeByte(v | 0x80);
            }else{
                stream.writeByte(v & 0x7f);
                break;
            }
            v >>= 7;
        }

        this.append(stream.buffer);

        return this;
    }

    /**
     * @return {number}
     */
    readVarInt(){
        let raw = this.readUnsignedVarInt();
        let tmp = (((raw << 63) >> 63) ^ raw) >> 1;
        return tmp ^ (raw & (1 << 63));
    }

    /**
     * @param v {number}
     * @return {BinaryStream}
     */
    writeVarInt(v){
        v <<= 32 >> 32;
        return this.writeUnsignedVarInt((v << 1) ^ (v >> 31));
    }

    /**
     * @return {number}
     */
    readUnsignedVarLong(){
        let value = 0;
        for(let i = 0; i <= 63; i += 7){
            let b = this.readByte();
            value |= ((b & 0x7f) << i);

            if((b & 0x80) === 0){
                return value;
            }
        }
        return 0;
    }

    /**
     * @param v {number}
     * @return {BinaryStream}
     */
    writeUnsignedVarLong(v){
        for(let i = 0; i < 10; i++){
            if((v >> 7) !== 0){
                this.writeByte(v | 0x80);
            }else{
                this.writeByte(v & 0x7f);
                break;
            }
            v >>= 7;
        }

        return this;
    }

    /**
     * @return {number}
     */
    readVarLong(){
        let raw = this.readUnsignedVarLong();
        let tmp = (((raw << 63) >> 63) ^ raw) >> 1;
        return tmp ^ (raw & (1 << 63));
    }

    /**
     * @param v {number}
     * @return {BinaryStream}
     */
    writeVarLong(v){
        return this.writeUnsignedVarLong((v << 1) ^ (v >> 63));
    }

    /**
     * @return {boolean}
     */
    feof(){
        return typeof this.getBuffer()[this.offset] === "undefined";
    }

    /**
     * Reads address from buffer
     * @return {{ip: string, port: number, version: number}}
     */
    readAddress(){
        let addr, port;
        let version = this.readByte();
        switch(version){
            default:
            case 4:
                addr = [];
                for(let i = 0; i < 4; i++){
                    addr.push(this.readByte() & 0xff);
                }
                addr = addr.join(".");
                port = this.readShort();
                break;
            // add ipv6 support
        }
        return {ip: addr, port: port, version: version};
    }

    /**
     * Writes address to buffer
     * @param addr    {string}
     * @param port    {number}
     * @param version {number}
     * @return {BinaryStream}
     */
    writeAddress(addr, port, version = 4){
        this.writeByte(version);
        switch(version){
            default:
            case 4:
                addr.split(".", 4).forEach(b => this.writeByte((Number(b)) & 0xff));
                this.writeShort(port);
                break;
        }
        return this;
    }

    /**
     * @param v {string}
     * @return {BinaryStream}
     */
    writeString(v){
        this.append(Buffer.from(v, "utf8"));
        return this;
    }

    flip(){
        this.offset = 0;
        return this;
    }

    /**
     * @param spaces {boolean}
     */
    toHex(spaces = false){
        let hex = this.buffer.toString("hex");
        return spaces ? hex.split(/(..)/).filter(v => v !== "").join(" ") : hex;
    }
}

module.exports = BinaryStream;