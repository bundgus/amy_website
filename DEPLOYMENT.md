# Cloudflare Worker Deployment Guide

This guide walks you through deploying the volunteer form submission system with Cloudflare Workers and D1 database.

## Prerequisites

1. Install Wrangler CLI:
   ```bash
   npm install -g wrangler
   ```

2. Authenticate with Cloudflare:
   ```bash
   wrangler login
   ```

## Database Setup

### 1. Create D1 Database

```bash
wrangler d1 create amyfortexas-volunteers
```

This command will return a database ID. Copy this ID and update it in `wrangler.toml`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "amyfortexas-volunteers"
database_id = "YOUR_DATABASE_ID_HERE"  # Replace with actual ID
```

### 2. Initialize Database Schema

Run the schema creation script:

```bash
wrangler d1 execute amyfortexas-volunteers --file=./schema.sql
```

### 3. Verify Database Setup

Check that the table was created:

```bash
wrangler d1 execute amyfortexas-volunteers --command="SELECT name FROM sqlite_master WHERE type='table';"
```

## Deployment

### 1. Deploy to Cloudflare

```bash
wrangler deploy
```

This will:
- Upload your Worker script
- Bind the D1 database
- Deploy to your custom domains (amyfortexas.org and www.amyfortexas.org)

### 2. Test the Deployment

Visit your website and navigate to the "Get Involved" page to test the form submission.

## Database Management

### View Submissions

To view volunteer submissions:

```bash
wrangler d1 execute amyfortexas-volunteers --command="SELECT * FROM volunteers ORDER BY submittedAt DESC LIMIT 10;"
```

### Export Data

To export all volunteer data:

```bash
wrangler d1 execute amyfortexas-volunteers --command="SELECT * FROM volunteers;" --json > volunteers.json
```

### Database Queries

Common queries for managing volunteer data:

```sql
-- Count total volunteers
SELECT COUNT(*) as total_volunteers FROM volunteers;

-- Count by ZIP code
SELECT zipCode, COUNT(*) as count FROM volunteers GROUP BY zipCode ORDER BY count DESC;

-- Recent submissions
SELECT firstName, lastName, email, submittedAt FROM volunteers ORDER BY submittedAt DESC LIMIT 20;

-- Volunteers by interest
SELECT interests, COUNT(*) as count FROM volunteers GROUP BY interests;
```

## Environment Variables

If you need to add environment variables (like email service credentials), use:

```bash
wrangler secret put VARIABLE_NAME
```

## Monitoring

Monitor your Worker's performance in the Cloudflare dashboard:
1. Go to Workers & Pages
2. Select your Worker
3. View metrics, logs, and analytics

## Troubleshooting

### Database Connection Issues
- Verify the database ID in `wrangler.toml` matches your created database
- Ensure the database schema was applied correctly

### Form Submission Errors
- Check the Worker logs: `wrangler tail`
- Verify CORS headers are properly set
- Test the API endpoint directly

### Deployment Issues
- Ensure you're authenticated: `wrangler whoami`
- Check that your domains are properly configured in Cloudflare

## Security Considerations

1. **Rate Limiting**: Consider implementing rate limiting to prevent spam
2. **Input Validation**: The Worker includes basic validation, but consider additional sanitization
3. **Data Privacy**: Ensure compliance with privacy laws (GDPR, CCPA) for volunteer data
4. **Backup**: Regular database backups via `wrangler d1 backup create`

## Next Steps

1. Set up email notifications for new volunteer submissions
2. Create an admin dashboard to view and manage volunteers
3. Implement volunteer assignment and communication features
4. Add analytics tracking for form completion rates
