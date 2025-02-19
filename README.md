---
title: PocketNet Proxy API Integration with Express.js
description: An Express.js template project demonstrating how to interact with the PocketNet API using PocketNetProxyApi library.
tags:
  - Node.js
  - TypeScript
  - PocketNet
  - API
  - Express
  - Backend
---

<p align='center'>
  <img src='./logo.png' alt='PocketNet' width='200'/>
</p>

<h6 align='center'>
<a href="https://github.com/DaniilKimlb/bastyon-miniapp-expressjs-template">GitHub Repository</a>
</h6>

<h5 align='center'>
<b>Express.js Template for PocketNet Integration</b>
</h5>

## Overview

The **Pocketnet API Integration** project serves as a template for building Express.js applications that interact with the PocketNet network. This template provides a pre-configured structure using Express, TypeScript, and other tools to simplify development and streamline integration with the PocketNetProxyApi library.

### Purpose

This project is designed to **quickly start** development and demonstrate how to interact with the PocketNet Proxy API using a structured approach. It includes pre-built routes and controllers to handle various RPC methods available in the PocketNet network, such as retrieving node information, managing transactions, and fetching user data. Developers can use this template to easily get started and see how to integrate and communicate with PocketNet's API using simple HTTP requests.

### Features

- ⚡️ **Express Integration**: A ready-to-use setup with Express for handling HTTP requests and routing.
- 📂 **File-based structure**: Organized folder structure for controllers, middlewares, and routes to make development and scaling easier.
- 🔧 **Pre-configured TypeScript**: TypeScript setup for better development experience, static typing, and code safety.
- 💡 **Auto-initialized PocketNetProxyApi instance**: Easily access the PocketNet API through a singleton instance.
- 🌐 **Supports multiple PocketNet RPC methods**: Directly call methods such as `getnodeinfo`, `getuserprofile`, `getaddressinfo`, and more.
- 🚀 **Ready for production**: Easily extend this template for your production needs by adding more routes, middlewares, and configurations.

## Quick Start

Follow these steps to quickly start the project and see how to interact with the PocketNet API:

1. **Clone the repository**:

   ```bash
   git clone https://github.com/DaniilKimlb/bastyon-miniapp-expressjs-template.git
   cd bastyon-miniapp-expressjs-template
   ```

2. **Install dependencies**:

   ```bash
   pnpm install
   ```

3. **Build the project**:

   ```bash
   pnpm build
   ```

4. **Start the server**:

   ```bash
   pnpm serve
   ```

5. **Test API endpoints**:

   Open your browser or use a tool like Postman to navigate to `http://localhost:3000/nodeinfo` and see the response from the `getnodeinfo` RPC method.

6. **Modify the project**:

   - Update or create new routes in the `src/routes` folder.
   - Add your own controllers and methods in the `src/controllers` folder.
   - Customize the PocketNetProxyApi instance in `src/lib/pocketNetProxyInstance.ts`.


## Directory Structure

```bash
src/
├── controllers/
│   └── pocketNetController.ts  # Contains the logic for interacting with the PocketNet API
├── lib/
│   └── pocketNetProxyInstance.ts  # Singleton instance of the PocketNetProxyApi class
├── middlewares/
│   └── errorHandler.ts  # Middleware for handling errors across the application
├── routes/
│   └── pocketNetRoutes.ts  # Routes for PocketNet API endpoints
├── app.ts  # Entry point of the application
└── server.ts  # Configures and starts the Express server
```

## Usage

This template project is structured to make it easy to get started and see how the PocketNetProxyApi library can be integrated with Express. Use the following steps to get started:

1. **Create and initialize PocketNetProxyApi**:

   The `PocketNetProxyApi` instance is automatically created and initialized in `src/lib/pocketNetProxyInstance.ts` and can be accessed across the application.

2. **Test API Routes**:

   Navigate to `http://localhost:3000/nodeinfo` to test the `getnodeinfo` RPC method. You can add more routes and handlers in `src/routes/pocketNetRoutes.ts`.

3. **Modify configurations**:

   Modify the default configurations in `src/config.ts` to set global variables or configure PocketNetProxyApi options:

   - **MIN_NODES_COUNT**: Minimum number of nodes required for the proxy to function correctly.
   - **WRITE_LOGS**: Enable or disable logging of actions.
   - **USE_TRUST_NODES_ONLY**: Set to `true` to use only trusted nodes for communication.
   - **REVERSE_PROXY**: Enable or disable reverse proxy usage.
   - **USE_TLS_NODES_ONLY**: Set to `true` to use only TLS-secured nodes.

## Example Routes

The project includes the following routes as examples for interacting with the PocketNet API:

- **GET `/nodeinfo`**: Retrieves information about the node using the `getnodeinfo` RPC method.

## Documentation

For a detailed list of available methods and their parameters, check the [PocketNet Proxy API Methods Documentation](https://github.com/DaniilKimlb/pocketnet-proxy-api/blob/master/README.md).

## License

This project is licensed under the Apache-2.0 License. See the [LICENSE](./LICENSE) file for more information.
