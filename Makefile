.PHONY: serve clean

serve:
	uv run mkdocs serve

clean:
	rm -rf site
