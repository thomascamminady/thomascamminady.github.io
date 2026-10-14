.PHONY: serve clean

serve:
		uv run mkdocs serve --watch theme

clean:
	rm -rf site
