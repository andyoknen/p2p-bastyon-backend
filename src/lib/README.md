# lib

This directory contains utility modules, helper functions, and instances used throughout the application. The purpose of these modules is to encapsulate reusable logic or objects that can be shared across different parts of the application.

### Files
- **pocketNetProxyInstance.ts**: Initializes and exports a singleton instance of the PocketNetProxyApi. This instance is used to interact with the PocketNet network and perform RPC calls. Import this module wherever you need to access the PocketNetProxyApi instance.

### Purpose
The `lib` directory helps in keeping the codebase organized by separating commonly used functionalities into their own modules, making it easier to maintain and update.
