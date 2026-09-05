// B70 Give Pip dialogue its own compact mobile lane.
const pipMoodB70=$('pipMood');pipMoodB70.setAttribute('role','status');pipMoodB70.setAttribute('aria-live','polite');pipMoodB70.setAttribute('aria-atomic','true');
const pipMoodStyleB70=document.createElement('style');pipMoodStyleB70.id='pipMoodStyleB70';
pipMoodStyleB70.textContent='@media(max-width:560px){#pipMood{top:181px;left:8px;right:auto;max-width:calc(100vw - 16px)}}';document.head.appendChild(pipMoodStyleB70);
