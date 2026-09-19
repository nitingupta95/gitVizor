import { db } from '../src/server/db';

async function main() {
  const users = await db.user.findMany({ select: { id: true, emailAddress: true, credits: true } });
  console.log('USERS:', users);

  const txs = await db.stripeTransaction.findMany();
  console.log('TXS:', txs);
}

main().catch(console.error).finally(() => db.$disconnect());
