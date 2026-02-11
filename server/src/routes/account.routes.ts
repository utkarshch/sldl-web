import { Router } from "express";
import { AccountStore } from "../services/account-store.js";
import { requireAuth } from "../auth/auth-middleware.js";

export function createAccountRoutes(accountStore: AccountStore) {
    const router = Router();

    // List accounts
    router.get("/", requireAuth, async (req, res) => {
        try {
            const accounts = await accountStore.getAccounts(req.user.id);
            // Mask passwords before sending client
            const safeAccounts = accounts.map(acc => ({
                ...acc,
                password: '•'.repeat(8) // Masked
            }));
            res.json(safeAccounts);
        } catch (error) {
            console.error("Get accounts error:", error);
            res.status(500).json({ error: "Failed to fetch accounts" });
        }
    });

    // Create account
    router.post("/", requireAuth, async (req, res) => {
        try {
            const { username, password } = req.body;
            if (!username || !password) {
                res.status(400).json({ error: "Username and password required" });
                return;
            }

            const account = await accountStore.createAccount(req.user.id, { username, password });
            res.json(account);
        } catch (error) {
            console.error("Create account error:", error);
            res.status(500).json({ error: "Failed to create account" });
        }
    });

    // Delete account
    router.delete("/:id", requireAuth, async (req, res) => {
        try {
            await accountStore.deleteAccount(req.user.id, req.params.id as string);
            res.json({ success: true });
        } catch (error) {
            console.error("Delete account error:", error);
            res.status(500).json({ error: "Failed to delete account" });
        }
    });

    // Set active
    router.put("/:id/activate", requireAuth, async (req, res) => {
        try {
            await accountStore.setActiveAccount(req.user.id, req.params.id as string);
            res.json({ success: true });
        } catch (error) {
            console.error("Activate account error:", error);
            res.status(500).json({ error: "Failed to activate account" });
        }
    });

    return router;
}
