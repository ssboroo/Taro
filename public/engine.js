export function randomInt(max, cryptoProvider = globalThis.crypto) {
  if (!Number.isInteger(max) || max < 1 || max > 4294967296) throw new RangeError('Invalid random range');
  const limit = Math.floor(4294967296 / max) * max;
  const buffer = new Uint32Array(1);
  do {cryptoProvider.getRandomValues(buffer);} while (buffer[0] >= limit);
  return buffer[0] % max;
}
export function shuffled(items, rng = randomInt) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {const j = rng(i + 1);[result[i],result[j]]=[result[j],result[i]];}
  return result;
}
export function drawReading(deck, count, reversed = false, significator = null, rng = randomInt) {
  if (![1,3,10].includes(count)) throw new RangeError('Unsupported spread');
  if (count === 10 && !deck.some(c => c.id === significator)) throw new Error('Choose a significator');
  let pool = shuffled(deck.filter(c => count !== 10 || c.id !== significator), rng);
  if (pool.length < count) throw new RangeError('Not enough cards');
  if (count === 10) for (let i=0;i<3;i++) {const cut=1+rng(pool.length-1);pool=[...pool.slice(cut),...pool.slice(0,cut)];}
  return pool.slice(0,count).map(card=>({id:card.id,reversed:reversed && rng(2)===1}));
}
export const positions = {
  1:['Энэ мөчийн эргэцүүлэл'],
  3:['Өнгөрсөн нөлөө','Одоогийн нөхцөл','Боломжит чиглэл'],
  10:['Өнөөгийн нөлөө','Хөндлөн саад','Зорилго ба дээд боломж','Суурь нөхцөл','Өнгөрч буй нөлөө','Ойртож буй нөлөө','Таны байр суурь','Хүрээлэл ба орчин','Найдвар ба айдас','Боломжит үр дүн']
};
export const prompts = {
  1:['Энэ бэлгэдэл таны өнөөдрийн ямар бодолтой холбогдож байна вэ?'],
  3:['Өнгөрсөн ямар туршлага одоо нөлөөлж байна вэ?','Яг одоо өөрчилж чадах нэг зүйл юу вэ?','Энэ чиглэлд алхвал ямар сонголтоо дахин шалгах вэ?'],
  10:['Нөхцөлд хамгийн их нөлөөлж буй зүйл юу вэ?','Юу танд саад болж байна вэ?','Та юунд хүрэхийг зорьж байна вэ?','Үүний сууринд ямар бодит нөхцөл байна вэ?','Ямар нөлөө холдож байна вэ?','Ямар өөрчлөлтөд бэлтгэж болох вэ?','Та өөрийн үүргийг хэрхэн харж байна вэ?','Орчноос юу дэмжиж эсвэл хязгаарлаж байна вэ?','Найдвар, айдас хоёр юугаараа ялгаатай вэ?','Энэ хувилбарын оронд өөр ямар үр дүн боломжтой вэ?']
};
