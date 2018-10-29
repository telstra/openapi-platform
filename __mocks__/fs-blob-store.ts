import through from 'through2';
import stream from 'stream';

export default function createStore() {
  const inMemoryStore = {};
  return {
    createReadStream(options) {
      const data = inMemoryStore[options.key];
      return through.obj(function(file, enc, callback) {
        callback(null, data);
      });
    },
    writeReadStream(options) {
      return new stream.Writable({
        write: function(chunk, encoding, next) {
          inMemoryStore[options.key] += chunk.toString();
          next();
        },
      });
    },
    remove(options) {
      delete inMemoryStore[options.key];
    },
  };
}
