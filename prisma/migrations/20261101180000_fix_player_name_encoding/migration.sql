-- Fix player names saved with broken text encoding, e.g. "SÃ¸rebÃ¸" -> "Sørebø".
-- These are UTF-8 bytes that were read as latin1 and saved again. Re-reading them as
-- latin1 bytes and decoding as UTF-8 restores the original name.
-- Only rows containing "Ã" (bytes C3 83) are touched, and only when the round trip is lossless.

UPDATE `Player`
SET `name` = CONVERT(CAST(CONVERT(`name` USING latin1) AS BINARY) USING utf8mb4)
WHERE INSTR(CAST(`name` AS BINARY), UNHEX('C383')) > 0
  AND CAST(CONVERT(CONVERT(`name` USING latin1) USING utf8mb4) AS BINARY) = CAST(`name` AS BINARY)
  AND CONVERT(CAST(CONVERT(`name` USING latin1) AS BINARY) USING utf8mb4) IS NOT NULL;

UPDATE `Player`
SET `nickname` = CONVERT(CAST(CONVERT(`nickname` USING latin1) AS BINARY) USING utf8mb4)
WHERE `nickname` IS NOT NULL
  AND INSTR(CAST(`nickname` AS BINARY), UNHEX('C383')) > 0
  AND CAST(CONVERT(CONVERT(`nickname` USING latin1) USING utf8mb4) AS BINARY) = CAST(`nickname` AS BINARY)
  AND CONVERT(CAST(CONVERT(`nickname` USING latin1) AS BINARY) USING utf8mb4) IS NOT NULL;
