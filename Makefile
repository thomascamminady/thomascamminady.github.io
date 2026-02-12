.PHONY: serve clean

serve:
		uv run mkdocs serve --watch ./

clean:
	rm -rf site
