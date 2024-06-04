# BinaryStream

`BinaryStream` is a TypeScript package designed to facilitate the reading and writing of binary data. This package leverages the `ArrayBuffer` and `DataView` interfaces, making it compatible with both Node.js and browser environments.

## Features

-   Supports both Node.js and browser environments.
-   Provides an easy-to-use API for handling binary data.
-   Methods for reading and writing various data types (integers, floats, strings, etc.).
-   Allows for dynamic buffer creation without worrying about resizing.

## Installation

You can install the `BinaryStream` package via npm:

```bash
npm install @pocketnode/binarystream
```

or

```bash
bun install @pocketnode/binarystream
```

## Usage

### Importing the Module

In a TypeScript or JavaScript file, import the `BinaryStream` module:

```typescript
import { BinaryStream } from "@pocketnode/binarystream";
// or through CDN
import { BinaryStream } from "https://unpkg.com/@pocketnode/binarystream@1.1.0/dist/BinaryStream.js";
```

### Creating a BinaryStream Instance

To create a new instance of `BinaryStream`, you can either provide an existing `ArrayBuffer` or specify the size of a new buffer:

```typescript
// Create a BinaryStream with a new ArrayBuffer of 1024 bytes
const stream = new BinaryStream(1024);

// Create a BinaryStream from an existing ArrayBuffer
const buffer = new ArrayBuffer(1024);
const streamFromBuffer = new BinaryStream(buffer);
```

### Example

Here is a complete example demonstrating how to write and read data using `BinaryStream`:

```typescript
import { BinaryStream } from "@pocketnode/binarystream";

// Create a BinaryStream with a new ArrayBuffer of 1024 bytes
const stream = new BinaryStream(1024);

// Write data to the stream
stream.writeUInt8(255);
stream.writeInt16(-32768);
stream.writeFloat32(3.14);
stream.writeString("Hello, BinaryStream!");

// Reset the position to the beginning of the stream for reading
stream.flip();

// Read data from the stream
const uint8 = stream.readUInt8();
const int16 = stream.readInt16();
const float32 = stream.readFloat32();
const str = stream.readString();

console.log(uint8); // 255
console.log(int16); // -32768
console.log(float32); // 3.14
console.log(str); // Hello, BinaryStream!
```

## Compatibility

`BinaryStream` works in both Node.js and browser environments. It relies on `ArrayBuffer` and `DataView`, which are available in [modern browsers](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer/transfer#browser_compatibility) and Node.js.

## License

This project is licensed under the GNU GPLv3 License. See the [LICENSE](LICENSE) file for details.

## Contact

For questions or feedback, please open an issue on [GitHub](https://github.com/pocketnode/binarystream).
