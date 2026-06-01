import fs from 'node:fs';
import path from 'node:path';
import { SCHEMA_SQL } from './schema.js';

function wrapDb(sqlDb, dbPath) {
  function persist() {
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(dbPath, Buffer.from(sqlDb.export()));
  }

  return {
    prepare(sql) {
      return {
        run(...params) {
          sqlDb.run(sql, params);
          persist();
        },
        get(...params) {
          const stmt = sqlDb.prepare(sql);
          try {
            if (params.length) stmt.bind(params);
            if (stmt.step()) return stmt.getAsObject();
            return undefined;
          } finally {
            stmt.free();
          }
        },
        all(...params) {
          const stmt = sqlDb.prepare(sql);
          try {
            if (params.length) stmt.bind(params);
            const rows = [];
            while (stmt.step()) rows.push(stmt.getAsObject());
            return rows;
          } finally {
            stmt.free();
          }
        },
      };
    },
    close() {
      persist();
      sqlDb.close();
    },
  };
}

export async function createSqlJsAdapter(dbPath) {
  const initSqlJs = (await import('sql.js')).default;
  const wasmPath = path.join(
    process.cwd(),
    'node_modules/sql.js/dist/sql-wasm.wasm'
  );
  const SQL = await initSqlJs({
    wasmBinary: fs.readFileSync(wasmPath),
  });

  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const isNew = !fs.existsSync(dbPath) || fs.statSync(dbPath).size === 0;
  const sqlDb = isNew
    ? new SQL.Database()
    : new SQL.Database(fs.readFileSync(dbPath));

  sqlDb.run('PRAGMA foreign_keys = ON');
  sqlDb.exec(SCHEMA_SQL);

  const adapter = wrapDb(sqlDb, dbPath);
  if (isNew) {
    fs.writeFileSync(dbPath, Buffer.from(sqlDb.export()));
  }

  return adapter;
}
