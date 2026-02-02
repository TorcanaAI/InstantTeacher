# Push InstantTeacher to GitHub — 3 steps

Your code is already committed. You just need to create a repo on GitHub and push.

---

## Step 1: Create a new repo on GitHub

1. Go to **https://github.com/new**
2. Sign in if asked (use the same email you use for this project).
3. **Repository name:** type **InstantTeacher**
4. Leave everything else as is (don’t add a README or .gitignore).
5. Click **Create repository**.

---

## Step 2: Copy your repo URL

On the next page, GitHub shows a URL like:

**https://github.com/YOUR_USERNAME/InstantTeacher.git**

Copy that whole line. (Replace YOUR_USERNAME with your actual GitHub username if you’re typing it.)

---

## Step 3: Run the push script

1. Open **PowerShell** or **Command Prompt**.
2. Go to your project folder:
   ```powershell
   cd C:\Users\justin\Desktop\InstantTeacher
   ```
3. Run the script (it will ask for your repo URL):
   ```powershell
   .\scripts\push-to-github.ps1
   ```
4. When it asks for the repository URL, paste the URL you copied (e.g. https://github.com/jkritzinger92/InstantTeacher.git) and press Enter.

Done. Your code will be on GitHub.

---

## If you prefer to run the commands yourself

After creating the repo on GitHub, run these two commands in your project folder (use your real GitHub username):

```powershell
git remote add origin https://github.com/YOUR_USERNAME/InstantTeacher.git
git push -u origin master
```

When Windows asks for your credentials, use your GitHub username and a **Personal Access Token** (not your GitHub password). To create a token: GitHub → Settings → Developer settings → Personal access tokens → Generate new token.
