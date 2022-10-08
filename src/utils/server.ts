import { Application } from 'express';
import db from '../database/connection';

export default class Bootstrap {
	private readonly app: Application;
	private readonly db_uri: string;
	private readonly PORT: string | number;

	constructor(app: Application, PORT: string | number, db_uri: string) {
		this.app = app;
		this.db_uri = db_uri;
		this.PORT = PORT;
	}

	public async init(): Promise<void> {
		try {
			await db(this.db_uri);
			this.app.listen(this.PORT, () => {
				console.log(`Server running on port ${this.PORT}`);
			});
		} catch (error) {
			console.error(error);
		}
	}
}
