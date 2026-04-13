import sys, os

filepath = os.path.join(os.path.dirname(__file__), '..', 'sell.html')
filepath = os.path.normpath(filepath)

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# ── OLD BLOCK ──────────────────────────────────────────────────────────────
OLD = """\
                            <!-- Photo Upload Area -->
                            <div class="photo-upload-area" id="photoUploadArea">
                                <div class="upload-icon">
                                    <i class="fas fa-camera"></i>
                                </div>
                                <div class="upload-title">Click here or drag photos to upload</div>
                                <div class="upload-instructions">
                                    <strong>Minimum 6 photos required</strong><br>
                                    Maximum 15 photos allowed<br>
                                    JPG, PNG, WEBP formats<br>
                                    Maximum 5MB per photo<br>
                                    <strong class="multiple-enabled">✓ Multiple selection enabled</strong>
                                </div>
                                <input type="file" id="photoInput" name="images[]" multiple accept="image/jpeg,image/png,image/jpg,image/webp">
                                <button type="button" class="btn btn-primary" id="photoUploadButton">
                                    <i class="fas fa-upload"></i> Choose Photos
                                </button>
                            </div>

                            <div class="photo-tips">
                                <h4><i class="fas fa-lightbulb"></i> Photo Tips</h4>
                                <ul>
                                    <li><strong>Front view</strong> - Make sure the car is clean and well-lit</li>
                                    <li><strong>Interior</strong> - Show dashboard, seats, and steering wheel</li>
                                    <li><strong>Engine bay</strong> - Clean engine shows good maintenance</li>
                                    <li><strong>All sides</strong> - Include rear, left, and right views</li>
                                    <li><strong>Wheels & tires</strong> - Close-up shots of tire condition</li>
                                    <li><strong>Any issues</strong> - Be transparent about any damage</li>
                                </ul>
                            </div>"""

# ── NEW BLOCK ──────────────────────────────────────────────────────────────
NEW = """\
                            <!-- Photo Upload Area - mobile-optimised -->
                            <div class="photo-upload-area" id="photoUploadArea">
                                <!-- Hidden file inputs (triggered by buttons below) -->
                                <input type="file" id="photoInput" name="images[]" multiple accept="image/jpeg,image/png,image/jpg,image/webp">
                                <input type="file" id="photoInputCamera" accept="image/jpeg,image/png,image/jpg,image/webp" capture="environment">
                                <!-- Desktop drag cue - hidden on mobile -->
                                <div class="upload-drop-cue desktop-only">
                                    <i class="fas fa-cloud-upload-alt"></i>
                                    <span>Drag &amp; drop photos here</span>
                                </div>
                                <!-- Large tap-target action buttons -->
                                <div class="upload-btn-row">
                                    <button type="button" class="upload-btn-camera" id="photoUploadCamera">
                                        <i class="fas fa-camera"></i>
                                        <span>Take Photo</span>
                                        <small>Use camera</small>
                                    </button>
                                    <button type="button" class="upload-btn-gallery" id="photoUploadButton">
                                        <i class="fas fa-images"></i>
                                        <span>Choose Files</span>
                                        <small>Gallery / multi-select</small>
                                    </button>
                                </div>
                                <p class="upload-rules">JPG &middot; PNG &middot; WEBP &nbsp;|&nbsp; Max 5 MB each &nbsp;|&nbsp; Up to 15 photos</p>
                            </div>

                            <div class="photo-tips">
                                <h4><i class="fas fa-lightbulb"></i> Photo Checklist</h4>
                                <ul>
                                    <li><i class="fas fa-check-circle" style="color:var(--primary-green)"></i> <strong>Front &amp; rear</strong> &mdash; car clean, well-lit</li>
                                    <li><i class="fas fa-check-circle" style="color:var(--primary-green)"></i> <strong>Both sides</strong> &mdash; left and right profiles</li>
                                    <li><i class="fas fa-check-circle" style="color:var(--primary-green)"></i> <strong>Interior</strong> &mdash; dashboard, seats, steering wheel</li>
                                    <li><i class="fas fa-check-circle" style="color:var(--primary-green)"></i> <strong>Engine bay</strong> &mdash; shows maintenance care</li>
                                    <li><i class="fas fa-check-circle" style="color:var(--primary-green)"></i> <strong>Wheels &amp; tyres</strong> &mdash; close-up condition shot</li>
                                    <li><i class="fas fa-check-circle" style="color:var(--primary-green)"></i> <strong>Any damage</strong> &mdash; be transparent, builds trust</li>
                                </ul>
                            </div>"""

if OLD in content:
    content = content.replace(OLD, NEW, 1)
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print('SUCCESS: photo upload area replaced')
else:
    # diagnose
    print('FAIL: searching for a key substring...')
    key = '<div class="upload-icon">'
    if key in content:
        print(f'  upload-icon div found at: {content.index(key)}')
    else:
        print('  upload-icon div NOT found')
    key2 = 'Choose Photos'
    if key2 in content:
        print(f'  Choose Photos found')
    else:
        print('  Choose Photos NOT found')
