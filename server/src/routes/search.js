import { Router } from "express" 
import { searchFoods } from "../controllers/search.js"
import { authenticateToken } from "../middleware/auth.js"

const router = Router() 

router.get('/', authenticateToken, searchFoods)

export default router