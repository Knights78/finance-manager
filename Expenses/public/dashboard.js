var crsr=document.getElementById("cursor")
var blur=document.getElementById("cursor-blur")
document.addEventListener("mousemove",function(dets){
    crsr.style.left=dets.x+"px";
    crsr.style.top=dets.y+"px";
    blur.style.left=dets.x-150+"px";
    blur.style.top=dets.y-150+"px";
})

var h4all=document.querySelectorAll("#nav h4")

h4all.forEach(function(elem){
    
    elem.addEventListener("mouseenter",function(){
        crsr.style.scale=3
        crsr.style.border="1px solid #fff"
        crsr.style.backgroundColor="transparent"
        
    })
    elem.addEventListener("mouseleave",function(){
        crsr.style.scale=1
        crsr.style.border="none"
        crsr.style.backgroundColor="rgba(214, 242, 30, 0.732)"
    })
})
gsap.from("#about-us img,#about-us-in",{
    y:90,//animation will start from below 90px from its original position
    opacity:0,//if we keep opacity 1 then all the elements will be seen already in case of 0 it is been hidden until the element appears 
    stagger:1,//element will come one by one
    duration:4,
    scrollTrigger:{
        trigger:"#about-us",
        scroller:"body",
        start:"top 60%",
        end:"top 80%",
        scrub:1

    }
})
gsap.from(".card",{
    scale:0.5,//animation will start from scale 0.5  from its original size
    opacity:0,//if we keep opacity 1 then all the elements will be seen already in case of 0 it is been hidden until the element appears 
    stagger:1,//element will come one by one
    duration:4,
    scrollTrigger:{
        trigger:".card",
        scroller:"body",
        start:"top 70%",
        end:"top 80%",
        scrub:1

    }
})
gsap.from("#colon1",{
    y:-70,
    x:-70,
    scrollTrigger:{
        trigger:"#colon1",
        scroller:"body",
        start:"top 55%",
        end:"top 45%",
        scrub:1

    }
})

gsap.from("#colon2",{
    y:-40,
    x:-70,
    scrollTrigger:{
        trigger:"#colon1",
        scroller:"body",
        start:"top 55%",
        end:"top 45%",
        scrub:1

    }
})
gsap.to("#nav",{
    backgroundColor:"black",
    duration:0.5,
    height:"100px",
    delay:1,
    scrollTrigger:{
        trigger:"#nav",
        scroller:"body",
        start:"top -10%",// background color tab dena hai jab body ko mai scroll kru and top upar ki taraf 10 percent khisak jaye means mai jab scroll niche krta hu at that time page is going upwards jab top -10 percent ho jaye tab krna hai asan bhasha mai  
        end:"top -12%",//ye property end tab krna hai jab top minus 12% pe aa jaye 
        scrub:1,
    }

})
gsap.to("#main",{
    backgroundColor:"black",
    duration:0.8,
    delay:1,
    scrollTrigger:{
         trigger:"#main",
         scroller:"body",
         start:"top -25%",
         end:"top -70%",
         scrub:1
    }
})