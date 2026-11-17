local root = vim.fn.getcwd()

vim.api.nvim_create_autocmd("BufWritePost", {
	group = vim.api.nvim_create_augroup("WebsiteBuild", { clear = true }),
	pattern = root .. "/*",
	callback = function()
		vim.system({ "python3", root .. "/build.py" })
	end,
})
