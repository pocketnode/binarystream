# BinaryStream

`BinaryStream` is an Typescript module designed to facilitate the reading and writing of binary data. This package uses the [`ArrayBuffer`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) and [`DataView`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DataView) interfaces, both of which are native to Javascript making it compatible with Node.js and browser environments.

## Features

-   Supports both Node.js and browser environments.
-   Provides an easy-to-use API for handling binary data.
-   Methods for reading and writing various data types (integers, floats, strings, etc.).
-   Allows for dynamic buffer creation without worrying about sizing.

## Installation

You can install the `BinaryStream` package via npm.

```bash
npm install @pocketnode/binarystream
```

or

```bash
bun install @pocketnode/binarystream
```

## Usage

### Importing the Module

```typescript
// Node.js, Bun, etc.
import BinaryStream from "@pocketnode/binarystream";

// Browser from CDN
import BinaryStream from "https://esm.run/@pocketnode/binarystream@latest/dist/BinaryStream.js";
```

### Creating an Instance

To create a new instance of `BinaryStream`, you can either provide an existing `ArrayBuffer` or specify the size of a new buffer:

```typescript
// Create an empty BinaryStream
const stream = new BinaryStream();

// Create a BinaryStream from an array of bytes
const bytes = BinaryStream.from([0xde, 0xad, 0xbe, 0xef]);
bytes.toString("hex"); // deadbeef

// Create a BinaryStream from a string
const str = BinaryStream.from("\xde\xad\xbe\xef", "binary");
str.toString("hex"); // deadbeef

// Create a BinaryStream from an existing ArrayBuffer
const blob = new Blob(..., {type: "application/octet-stream"});
const streamFromBuffer = BinaryStream.from(await blob.arrayBuffer());
```

### Example

Here is an example demonstrating how to write and read data using `BinaryStream`:

```typescript
const stream = new BinaryStream();

// Write data to the stream
stream.writeUInt8(255);
stream.writeInt16(-32768);
stream.writeFloat32(3.14);
stream.write(new TextEncoder().encode("Hello, BinaryStream!"));

// Reset the position to the beginning of the stream for reading
stream.flip();

// Read data from the stream
const uint8 = stream.readUInt8();
const int16 = stream.readInt16();
const float32 = stream.readFloat32();
const str = stream.readRest();

console.log(uint8); // 255
console.log(int16); // -32768
console.log(float32); // 3.14
console.log(new TextDecoder().decode(str)); // Hello, BinaryStream!
console.log(stream.buffer); // Uint8Array (31) [255, 128, 0, 64, 72, 245, 195, 0, 0, 0, 20, 72, 101, 108, 108, 111, 44, 32, 66, 105, 110, 97, 114, 121, 83, 116, 114, 101, 97, 109, 33]
```

## License

This project is licensed under the GNU GPLv3 License. See the [LICENSE](LICENSE) file for details.

## Contact

For questions or feedback, please open an issue on [GitHub](https://github.com/pocketnode/binarystream).
