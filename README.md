# BinaryStream TypeScript Package

## Overview

`BinaryStream` is a TypeScript package designed to facilitate the reading and writing of binary data. This package leverages the `ArrayBuffer` and `DataView` interfaces, making it compatible with both Node.js and browser environments.

## Features

-   Supports both Node.js and browser environments.
-   Provides an easy-to-use API for handling binary data.
-   Utilizes `ArrayBuffer` and `DataView` for efficient binary data manipulation.
-   Methods for reading and writing various data types (integers, floats, strings, etc.).

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
import { BinaryStream } from "binarystream";
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

### Writing Data

The `BinaryStream` class provides methods to write various data types:

```typescript
stream.writeUint8(255); // Write an unsigned 8-bit integer
stream.writeInt16(-32768); // Write a signed 16-bit integer
stream.writeFloat32(3.14); // Write a 32-bit float
stream.writeString("Hello"); // Write a string
```

### Reading Data

Similarly, you can read data using corresponding methods:

```typescript
const uint8 = stream.readUint8(); // Read an unsigned 8-bit integer
const int16 = stream.readInt16(); // Read a signed 16-bit integer
const float32 = stream.readFloat32(); // Read a 32-bit float
const str = stream.readString(); // Read a string
```

### Example

Here is a complete example demonstrating how to write and read data using `BinaryStream`:

```typescript
import { BinaryStream } from "binarystream";

// Create a BinaryStream with a new ArrayBuffer of 1024 bytes
const stream = new BinaryStream(1024);

// Write data to the stream
stream.writeUint8(255);
stream.writeInt16(-32768);
stream.writeFloat32(3.14);
stream.writeString("Hello, BinaryStream!");

// Reset the position to the beginning of the stream for reading
stream.position = 0;

// Read data from the stream
const uint8 = stream.readUint8();
const int16 = stream.readInt16();
const float32 = stream.readFloat32();
const str = stream.readString();

console.log(uint8); // 255
console.log(int16); // -32768
console.log(float32); // 3.14
console.log(str); // Hello, BinaryStream!
```

## API Documentation

### BinaryStream

#### Constructor

-   `new BinaryStream(size: number): BinaryStream`
-   `new BinaryStream(buffer: ArrayBuffer): BinaryStream`

#### Methods

-   `writeUint8(value: number): void`
-   `writeInt16(value: number): void`
-   `writeFloat32(value: number): void`
-   `writeString(value: string): void`

-   `readUint8(): number`
-   `readInt16(): number`
-   `readFloat32(): number`
-   `readString(): string`

#### Properties

-   `position: number` - The current read/write position in the buffer.
-   `buffer: ArrayBuffer` - The underlying `ArrayBuffer`.

## Compatibility

`BinaryStream` works in both Node.js and browser environments. It relies on `ArrayBuffer` and `DataView`, which are available in modern browsers and Node.js.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Please read the [CONTRIBUTING](CONTRIBUTING.md) guidelines for more information.

## Contact

For questions or feedback, please open an issue on the [GitHub repository](https://github.com/yourusername/binarystream).

---

Thank you for using `BinaryStream`! We hope it simplifies your binary data handling tasks.
