import { db } from '../src/server/db'

async function main() {
  const sample = await db.sourceCodeEmbedding.findFirst({
    select: {
      fileName: true,
      summaryEmbedding: true
    }
  })
  console.log('Is summaryEmbedding null?', sample?.summaryEmbedding === null)
  console.log('Is summaryEmbedding undefined?', sample?.summaryEmbedding === undefined)
  if (sample?.summaryEmbedding) {
      console.log('summaryEmbedding type:', typeof sample.summaryEmbedding);
      // @ts-ignore
      console.log('length:', sample.summaryEmbedding.length ?? 'no length');
  }
}
main().catch(console.error).finally(() => db.$disconnect())
