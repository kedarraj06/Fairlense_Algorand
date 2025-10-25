declare module 'buffer' {
  export const Buffer: {
    from(arrayBuffer: WithImplicitCoercion<ArrayBufferLike>, byteOffset?: number, length?: number): Buffer<ArrayBufferLike>;
    from(string: WithImplicitCoercion<string>, encoding?: BufferEncoding): Buffer<ArrayBuffer>;
  };
}