async function downloadResume(btn) {
  const originalText = btn.textContent;
  btn.textContent = 'Preparing...';
  btn.disabled = true;
  document.querySelectorAll('.no-print').forEach((element) => {
    element.style.display = 'none';
  });
  const resume = document.getElementById('resume');

  try {
    const canvas = await html2canvas(resume, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
      onclone: (clonedDocument) => {
        const clonedResume = clonedDocument.getElementById('resume');
        clonedResume.style.boxShadow = 'none';
        clonedResume.style.margin = '0';
      }
    });

    const { jsPDF } = window.jspdf;
    const pdfWidth = 210;
    const pdfHeight = canvas.height / canvas.width * pdfWidth;
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [pdfWidth, pdfHeight] });
    pdf.addImage(canvas.toDataURL('image/jpeg', 1), 'JPEG', 0, 0, pdfWidth, pdfHeight);

    const linkedinLink = resume.querySelector('.linkedin-line a');
    if (linkedinLink) {
      const resumeRect = resume.getBoundingClientRect();
      const linkRect = linkedinLink.getBoundingClientRect();
      const scaleX = pdfWidth / resume.offsetWidth;
      const scaleY = pdfHeight / resume.offsetHeight;
      const padding = 2;
      pdf.link(
        Math.max(0, (linkRect.left - resumeRect.left) * scaleX - padding),
        Math.max(0, (linkRect.top - resumeRect.top) * scaleY - padding),
        linkRect.width * scaleX + padding * 2,
        linkRect.height * scaleY + padding * 2,
        { url: linkedinLink.href }
      );
    }

    pdf.save('Joshni-Ganaparthi-Resume.pdf');
    flashStatus('Downloaded');
  } catch (error) {
    console.error('Resume download failed:', error);
    alert('Download failed. Check the browser console for details.');
  } finally {
    document.querySelectorAll('.no-print').forEach((element) => {
      element.style.display = '';
    });
    btn.textContent = originalText;
    btn.disabled = false;
  }
}

const STORAGE_KEY = 'resume_data_josh_jd_focused_v6';

document.addEventListener('input', () => {
  clearTimeout(window._saveTimer);
  window._saveTimer = setTimeout(saveData, 800);
});

function addBullet(listId) {
  const list = document.getElementById(listId);
  if (!list) return;
  const item = document.createElement('li');
  item.contentEditable = 'true';
  item.spellcheck = false;
  item.textContent = 'New item';
  list.appendChild(item);
  item.focus();
  const range = document.createRange();
  range.selectNodeContents(item);
  const selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);
}

function collectData() {
  return Array.from(document.querySelectorAll('[contenteditable]')).map((element, index) => ({
    index,
    html: element.innerHTML
  }));
}

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(collectData()));
  flashStatus('Saved');
}

function loadData() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) {
    flashStatus('Nothing saved yet');
    return;
  }

  const elements = document.querySelectorAll('[contenteditable]');
  JSON.parse(saved).forEach(({ index, html }) => {
    if (elements[index]) elements[index].innerHTML = html;
  });
  flashStatus('Loaded');
}

function resetData() {
  if (!confirm('Reset to original resume data? All your edits will be lost.')) return;
  localStorage.removeItem(STORAGE_KEY);
  location.reload();
}

function flashStatus(message) {
  let status = document.getElementById('save-status');
  if (!status) {
    status = document.createElement('span');
    status.id = 'save-status';
    status.style.cssText = 'font-size:12px;opacity:1;transition:opacity 1.5s;margin-left:8px;color:#a8e6a8;';
    document.querySelector('.toolbar-title').after(status);
  }
  status.textContent = message;
  status.style.opacity = '1';
  setTimeout(() => { status.style.opacity = '0'; }, 2000);
}

window.addEventListener('DOMContentLoaded', () => {
  if (localStorage.getItem(STORAGE_KEY)) loadData();
});
