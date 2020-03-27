/* eslint-disable no-unused-expressions */
import express from 'express';
import bodyParser from 'body-parser';
import Store from 'electron-store';
import puppeteer from 'puppeteer';
import axios from 'axios';
import cors from 'cors';
import routes from './routes';

class Server {
  constructor(port) {
    this.port = port;
    this.app = null;
    this.server = null;
    this.store = null;
    this.browser = null;
    this.client = null;
    this.container = {};
  }

  async start() {
    this.app = express();
    this.store = new Store();
    this.client = token => axios.create({
      baseURL: 'https://partners-api.999.md/',
      auth: {
        username: token,
        password: '',
      },
    });
    this.browser = await puppeteer.launch({
      headless: !process.env.SHOW_BROWSER,
    });

    this.app.use(cors({ origin: true }));
    this.app.use(bodyParser.json({ strict: false, type: '*/*' }));
    await routes(this);

    return new Promise((resolve) => {
      this.server = this.app.listen(this.port);
      this.server.on('listening', () => resolve());
    });
  }

  async stop() {
    this.server && this.server.close();
    this.browser && await this.browser.close();

    this.app = null;
    this.server = null;
    this.store = null;
    this.browser = null;
    this.client = null;
    this.container = {};

    return this;
  }

  get isRunning() {
    return this.server && this.browser;
  }
}

export default Server;
