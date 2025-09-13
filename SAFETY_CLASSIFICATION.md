# Safety Classification System

This document describes the rule-based safety classification system for cache files in the Cache App.

## Overview

The safety classification system analyzes cache files and categorizes them into three safety levels:
- **Safe**: Files that can be safely deleted
- **Caution**: Files that require user review before deletion
- **Risky**: Files that should not be deleted due to system-critical nature

## Classification Rules

### File Age Rules
- **Safe**: Files older than 30 days are generally safer to delete
- **Caution**: Files newer than 7 days need more careful consideration
- **Risky**: Recent files in system-critical locations are flagged as risky

### File Size Rules
- **Large Files**: Files larger than 100MB are flagged for user attention
- **Small Files**: Files smaller than 1KB get a slight confidence boost

### Location-Based Rules

#### System-Critical Locations (Risky)
- `/System/`
- `/usr/`
- `/var/log/`
- `/Library/Logs/`
- `/Applications/`
- `/bin/`
- `/sbin/`
- `/Library/Logs/`
- `/System/Library/`
- `/private/var/db/`
- `/private/var/run/`

#### Temporary Directories (Safe)
- `/tmp/`
- `/var/tmp/`
- `~/Library/Caches/`
- `/private/var/folders/`
- Directories containing: `temp`, `tmp`, `cache`

#### Development Cache Patterns (Caution)
- `node_modules`
- `.git`
- `build/`
- `dist/`
- `target/`
- `.gradle`
- `.m2/`

## Confidence Scoring

The system provides confidence scores from 0-100% based on:
- **Base confidence**: 50%
- **Age factors**: +20% for old files, -15% for recent files
- **Size factors**: -10% for large files, +5% for small files
- **Location factors**: +25% for temp directories, -30% for system-critical locations
- **Permission factors**: -5% for read-only files

## API Endpoints

### Get Safety Classification Summary
```go
GetSafetyClassificationSummary(locationID string) (string, error)
```
Returns a summary of safety classifications for a scanned location.

### Classify File Safety
```go
ClassifyFileSafety(filePath string) (string, error)
```
Classifies the safety of a specific file.

### Get Safety Classification Rules
```go
GetSafetyClassificationRules() (string, error)
```
Returns the current classification rules and thresholds.

### Get Files by Safety Level
```go
GetFilesBySafetyLevel(locationID, safetyLevel string) (string, error)
```
Returns files filtered by safety level (Safe, Caution, or Risky).

## Example Output

```json
{
  "level": "Safe",
  "confidence": 95,
  "explanation": "This file is classified as SAFE to delete with 95% confidence. Key factors: File is 35 days old (safe threshold: 30 days); Located in temporary directory. It appears to be a temporary or cache file that can be safely removed without affecting system functionality.",
  "reasons": [
    "File is 35 days old (safe threshold: 30 days)",
    "Located in temporary directory"
  ]
}
```

## Integration

The safety classification system is automatically integrated into the cache scanner. When files are scanned, they are automatically classified and the classification results are included in the scan output.

## Customization

The classification rules can be customized by modifying the `ClassificationConfig` in the safety package. The system is designed to be extensible and allows for easy addition of new rules or modification of existing ones.
