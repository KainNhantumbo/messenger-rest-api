import { Server } from 'http';
import mongoose from 'mongoose';

type TServerProps = {
 app: Server;
 db_uri: string;
 readonly PORT: string | number;

}

export default class Bootstrap {
  private readonly props: TServerProps

  constructor(props: TServerProps) {
    this.props = props
  }

  public async init(): Promise<void> {
    try {
      await mongoose.connect(this.props.db_uri);
      this.props.app.listen(this.props.PORT, () => {
        console.log(`Server running... Port: ${this.props.PORT}`);
      });

    } catch (error) {
      console.error(error);
      process.exit(process.exitCode || 0);

    }
  }
}