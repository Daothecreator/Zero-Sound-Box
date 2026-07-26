with open("components/AcousticSynthesizer.tsx", "r") as f:
    content = f.read()

# Let's wrap the whole thing in <> and remove the extra </div> at the end, if any.
content = content.replace("  return (\n    <div className=\"relative w-full", "  return (\n    <>\n    <div className=\"relative w-full")

# If there is an extra </div> before ); }, let's remove it.
# Actually, if we just parse JSX properly:
# The return block starts at `return (`
# Let's just wrap it in a fragment and if the linter complains about an extra `</div>`, we remove it.
# Let's look at the end of the file.
end_str = """      )}
    </div>
  );
}"""

if end_str in content:
    # If the main div was supposed to close here, then why did it close on 777?
    # Because there are TOO MANY closing divs inside the main block!
    pass

