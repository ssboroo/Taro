CREATE TABLE tarot_orders (
 id TEXT PRIMARY KEY NOT NULL,
 token_hash TEXT NOT NULL,
 fingerprint TEXT NOT NULL,
 reading_json TEXT NOT NULL,
 status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','paid')),
 amount INTEGER NOT NULL DEFAULT 5000 CHECK(amount=5000),
 intent_id TEXT UNIQUE,
 checkout_url TEXT,
 expires_at INTEGER,
 checked_at INTEGER,
 paid_at INTEGER,
 created_at INTEGER NOT NULL,
 updated_at INTEGER NOT NULL
);
