import { stopServing } from './shared';

export default async function globalTeardown() {
	await stopServing();
}