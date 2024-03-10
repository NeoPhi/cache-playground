```
$ lscpu
Architecture:            x86_64
  CPU op-mode(s):        32-bit, 64-bit
  Address sizes:         40 bits physical, 48 bits virtual
  Byte Order:            Little Endian
CPU(s):                  2
  On-line CPU(s) list:   0,1
Vendor ID:               GenuineIntel
  Model name:            Intel(R) Xeon(R) Platinum 8168 CPU @ 2.70GHz
    CPU family:          6
    Model:               85
    Thread(s) per core:  1
    Core(s) per socket:  2
    Socket(s):           1
    Stepping:            4
    BogoMIPS:            5387.34
    Flags:               fpu vme de pse tsc msr pae mce cx8 apic sep mtrr pge mca cmov pat pse36 clflush mmx fxsr sse sse2 ss ht sysca
                         ll nx pdpe1gb rdtscp lm constant_tsc arch_perfmon rep_good nopl xtopology cpuid tsc_known_freq pni pclmulqdq
                         vmx ssse3 fma cx16 pcid sse4_1 sse4_2 x2apic movbe popcnt tsc_deadline_timer aes xsave avx f16c rdrand hyperv
                         isor lahf_lm abm 3dnowprefetch cpuid_fault invpcid_single pti ssbd ibrs ibpb tpr_shadow vnmi flexpriority ept
                          vpid ept_ad fsgsbase tsc_adjust bmi1 avx2 smep bmi2 erms invpcid avx512f avx512dq rdseed adx smap clflushopt
                          clwb avx512cd avx512bw avx512vl xsaveopt xsavec xgetbv1 arat pku ospke md_clear
Virtualization features:
  Virtualization:        VT-x
  Hypervisor vendor:     KVM
  Virtualization type:   full
Caches (sum of all):
  L1d:                   64 KiB (2 instances)
  L1i:                   64 KiB (2 instances)
  L2:                    8 MiB (2 instances)
NUMA:
  NUMA node(s):          1
  NUMA node0 CPU(s):     0,1
Vulnerabilities:
  Itlb multihit:         KVM: Mitigation: VMX disabled
  L1tf:                  Mitigation; PTE Inversion; VMX conditional cache flushes, SMT disabled
  Mds:                   Mitigation; Clear CPU buffers; SMT Host state unknown
  Meltdown:              Mitigation; PTI
  Mmio stale data:       Vulnerable: Clear CPU buffers attempted, no microcode; SMT Host state unknown
  Retbleed:              Mitigation; IBRS
  Spec store bypass:     Mitigation; Speculative Store Bypass disabled via prctl
  Spectre v1:            Mitigation; usercopy/swapgs barriers and __user pointer sanitization
  Spectre v2:            Mitigation; IBRS, IBPB conditional, STIBP disabled, RSB filling, PBRSB-eIBRS Not affected
  Srbds:                 Not affected
  Tsx async abort:       Not affected
```

```
$ hostnamectl
 Static hostname: cache-playground
       Icon name: computer-vm
         Chassis: vm 🖴
      Machine ID: ################################
         Boot ID: ################################
  Virtualization: kvm
Operating System: Debian GNU/Linux 12 (bookworm)
          Kernel: Linux 6.1.0-9-amd64
    Architecture: x86-64
 Hardware Vendor: DigitalOcean
  Hardware Model: Droplet
Firmware Version: 20171212
```

```
$ node --version
v20.11.1
```
