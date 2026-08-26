import neo4js from 'neo4j-driver';
import dotenv from 'dotenv';

dotenv.config();

export const driver = neo4js.driver(
  process.env.COGNODB_URI!,
  neo4js.auth.basic(
    process.env.COGNODB_USERNAME!,
    process.env.COGNODB_PASSWORD!,
  ),
);

const verifyConnection = async () => {
  try {
    await driver.verifyConnectivity();
    console.log('connected to CognoDb');
  } catch (error: unknown) {
    console.error(
      'CognoDB connection failed:',
      error instanceof Error ? error.message : String(error),
    );
    process.exit(1);
  }
};

export default verifyConnection;
